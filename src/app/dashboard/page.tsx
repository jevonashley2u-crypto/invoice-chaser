import { AppLayout } from "@/components/layout/app-layout"
import { createClient } from "@/lib/supabase/server"
import { requireBusinessSetup } from "@/lib/onboarding"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StatusChart } from "@/components/dashboard/status-chart"
import { RecentActivity, ActivityItem } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { startOfMonth, isToday, isBefore, isAfter, subMonths, format, subDays, addDays } from "date-fns"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default async function DashboardPage() {
  const { businessId } = await requireBusinessSetup()
  const supabase = await createClient()

  // Fetch Business details
  const { data: business } = await supabase
    .from('businesses')
    .select('stripe_account_id')
    .eq('id', businessId)
    .single()

  const isStripeConnected = !!business?.stripe_account_id

  // 1. Fetch Invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, issue_date, due_date, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  // 2. Fetch Clients (for recent activity & mapping)
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  const allInvoices = invoices || []
  const allClients = clients || []

  // --- Metrics Calculation ---
  const today = new Date()
  const currentMonthStart = startOfMonth(today)
  const next7Days = addDays(today, 7)

  let todayRevenue = 0
  let monthlyRevenue = 0
  let outstandingCount = 0
  let outstandingAmount = 0
  let overdueCount = 0
  let overdueAmount = 0
  let upcomingCount = 0
  let upcomingAmount = 0

  allInvoices.forEach(inv => {
    const total = Number(inv.total)
    const dueDate = new Date(inv.due_date)
    const createdDate = new Date(inv.created_at)

    if (inv.status === 'paid') {
      if (isToday(createdDate)) todayRevenue += total
      if (isAfter(createdDate, currentMonthStart) || createdDate.getTime() === currentMonthStart.getTime()) {
        monthlyRevenue += total
      }
    } else if (inv.status === 'sent') {
      // Outstanding (sent but not paid)
      outstandingCount++
      outstandingAmount += total

      // Check overdue
      if (isBefore(dueDate, today)) {
        overdueCount++
        overdueAmount += total
      }
      
      // Check upcoming (due within next 7 days, but not overdue)
      if (isAfter(dueDate, today) && isBefore(dueDate, next7Days)) {
        upcomingCount++
        upcomingAmount += total
      }
    }
  })

  // Calculate Health Score (0-100)
  // Simple algorithm: 100 base score. Deduct heavily for overdue vs total outstanding.
  let healthScore = 100
  const totalActive = outstandingCount + overdueCount
  if (totalActive > 0) {
    const overdueRatio = overdueCount / totalActive
    healthScore = Math.max(0, Math.round(100 - (overdueRatio * 100)))
  } else if (allInvoices.length === 0) {
    healthScore = 100 // Perfect health if starting fresh
  }

  const metrics = {
    todayRevenue,
    monthlyRevenue,
    outstandingCount,
    outstandingAmount,
    overdueCount,
    overdueAmount,
    upcomingCount,
    upcomingAmount,
    healthScore
  }

  // --- Revenue Chart Data (Last 6 months) ---
  const revenueData = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(today, i)
    const monthName = format(monthDate, 'MMM')
    const monthStart = startOfMonth(monthDate)
    const monthEnd = startOfMonth(subMonths(today, i - 1))
    
    // Sum paid invoices in this month
    const rev = allInvoices
      .filter(inv => inv.status === 'paid')
      .filter(inv => {
        const d = new Date(inv.created_at)
        return isAfter(d, monthStart) && isBefore(d, monthEnd)
      })
      .reduce((sum, inv) => sum + Number(inv.total), 0)
      
    revenueData.push({ month: monthName, revenue: rev })
  }

  // --- Status Chart Data ---
  let draftCount = 0, sentCount = 0, paidCount = 0, overdueStatusCount = 0
  allInvoices.forEach(inv => {
    if (inv.status === 'draft') draftCount++
    else if (inv.status === 'paid') paidCount++
    else if (inv.status === 'sent') {
      if (isBefore(new Date(inv.due_date), today)) overdueStatusCount++
      else sentCount++
    }
  })

  const statusData = [
    { name: 'Draft', value: draftCount, color: '#94a3b8' }, // zinc-400
    { name: 'Sent', value: sentCount, color: '#3b82f6' }, // blue-500
    { name: 'Paid', value: paidCount, color: '#10b981' }, // emerald-500
    { name: 'Overdue', value: overdueStatusCount, color: '#f43f5e' } // rose-500
  ]

  // --- Recent Activity ---
  // Combine latest invoices and clients into a timeline
  const activities: ActivityItem[] = []
  
  allInvoices.slice(0, 10).forEach(inv => {
    if (inv.status === 'paid') {
      activities.push({
        id: `paid-${inv.id}`,
        type: 'invoice_paid',
        title: `Invoice ${inv.invoice_number} Paid`,
        description: `$${Number(inv.total).toFixed(2)} was successfully paid.`,
        timestamp: inv.created_at // ideally this would be an 'updated_at' timestamp
      })
    } else if (inv.status === 'draft' || inv.status === 'sent') {
      activities.push({
        id: `created-${inv.id}`,
        type: 'invoice_created',
        title: `Invoice ${inv.invoice_number} Created`,
        description: `Drafted for $${Number(inv.total).toFixed(2)}.`,
        timestamp: inv.created_at
      })
    }
  })

  allClients.slice(0, 5).forEach(client => {
    activities.push({
      id: `client-${client.id}`,
      type: 'client_added',
      title: 'New Client Added',
      description: `${client.name} was added to your directory.`,
      timestamp: client.created_at
    })
  })

  // Sort activities by timestamp descending and take top 8
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const recentActivities = activities.slice(0, 8)

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-1 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Overview</h1>
            <p className="text-muted-foreground mt-1">Here is what's happening with your business today.</p>
          </div>
        </div>

        {!isStripeConnected && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-600 shadow-sm max-w-4xl">
            <AlertCircle className="h-4 w-4" color="currentColor" />
            <AlertTitle>Action Required: Connect Stripe</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>You must connect a bank account before your clients can pay you.</span>
              <Link href="/settings/payments" className={buttonVariants({ variant: "destructive", size: "sm", className: "whitespace-nowrap shadow-sm hover:bg-red-600" })}>
                Connect Stripe
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <OverviewCards metrics={metrics} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <RevenueChart data={revenueData} />
          <StatusChart data={statusData} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <RecentActivity activities={recentActivities} />
          <QuickActions />
        </div>
      </div>
    </AppLayout>
  )
}
