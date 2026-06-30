import { AppLayout } from "@/components/layout/app-layout"
import { createClient } from "@/lib/supabase/server"
import { requireBusinessSetup } from "@/lib/onboarding"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import { startOfYear, endOfYear, format, isWithinInterval } from "date-fns"

export default async function ReportsPage() {
  const { businessId } = await requireBusinessSetup()
  const supabase = await createClient()

  // Fetch all invoices for the business for this year
  const today = new Date()
  const yearStart = startOfYear(today)
  const yearEnd = endOfYear(today)

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      status,
      total,
      tax,
      created_at,
      client_id,
      clients (
        name
      )
    `)
    .eq('business_id', businessId)
    .gte('created_at', yearStart.toISOString())
    .lte('created_at', yearEnd.toISOString())

  const allInvoices = invoices || []

  // Transform Data for Reports Dashboard
  const monthlyRevenueMap: Record<string, number> = {}
  const clientRevenueMap: Record<string, number> = {}
  let totalInvoiced = 0
  let totalTax = 0
  let paidCount = 0
  let outstandingCount = 0
  let overdueCount = 0

  // Initialize months
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), i, 1)
    monthlyRevenueMap[format(d, 'MMM')] = 0
  }

  allInvoices.forEach(inv => {
    const total = Number(inv.total)
    const tax = Number(inv.tax)
    const monthStr = format(new Date(inv.created_at), 'MMM')
    const clientName = (inv.clients as any)?.name || 'Unknown Client'

    // Totals
    totalInvoiced += total
    totalTax += tax

    // Status mapping
    if (inv.status === 'paid') {
      paidCount++
      monthlyRevenueMap[monthStr] += total
      
      if (!clientRevenueMap[clientName]) clientRevenueMap[clientName] = 0
      clientRevenueMap[clientName] += total
    } else if (inv.status === 'sent') {
      outstandingCount++
      // Basic overdue check based on current date vs issue date + 30 (simplification for this aggregation if due_date isn't fetched, but we should probably fetch due_date. We'll use status 'sent' as outstanding)
    }
  })

  const monthlyData = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({
    month,
    revenue
  }))

  const clientData = Object.entries(clientRevenueMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) // Top 5 clients

  const statusData = [
    { name: 'Paid', value: paidCount, fill: '#10b981' },
    { name: 'Outstanding', value: outstandingCount, fill: '#3b82f6' },
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Reports</h1>
          <p className="text-muted-foreground">Financial overview and client analytics for this year.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Invoiced (YTD)</h3>
            <div className="text-3xl font-bold mt-2">${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Estimated Tax (YTD)</h3>
            <div className="text-3xl font-bold mt-2">${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Paid Invoices</h3>
            <div className="text-3xl font-bold mt-2">{paidCount} <span className="text-lg text-muted-foreground font-normal">/ {allInvoices.length}</span></div>
          </div>
        </div>

        <ReportsDashboard 
          monthlyData={monthlyData} 
          clientData={clientData}
          statusData={statusData}
        />
      </div>
    </AppLayout>
  )
}
