import { createClient } from "@supabase/supabase-js"
import { Shield, Users, CreditCard, Activity, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Pricing values for MRR calculation
const TIER_PRICES = {
  starter: 29,
  pro: 79,
  business: 199,
  none: 0
}

export default async function AdminDashboardPage() {
  // Use Service Role Key to bypass RLS and view all platform data
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: businesses, error } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  const allBusinesses = businesses || []

  // Metrics calculation
  const totalBusinesses = allBusinesses.length
  let activeSubscriptions = 0
  let totalMRR = 0
  
  const tierCounts = {
    starter: 0,
    pro: 0,
    business: 0,
    none: 0
  }

  allBusinesses.forEach(b => {
    if (b.subscription_status === 'active' || b.subscription_status === 'trialing') {
      activeSubscriptions++
      const tier = (b.tier as keyof typeof TIER_PRICES) || 'none'
      totalMRR += TIER_PRICES[tier] || 0
      
      if (tierCounts[tier] !== undefined) {
        tierCounts[tier]++
      }
    }
  })

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="px-6 h-16 flex items-center border-b bg-background">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Shield className="h-5 w-5" />
          Platform Admin
        </div>
      </header>
      
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Platform Overview</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalMRR.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeSubscriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBusinesses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pro & Business Tier</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tierCounts.pro + tierCounts.business}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe Connected</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No businesses signed up yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  allBusinesses.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="capitalize">{b.tier || 'None'}</TableCell>
                      <TableCell>
                        <Badge variant={b.subscription_status === 'active' ? 'default' : 'secondary'}>
                          {b.subscription_status || 'none'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {b.stripe_account_id ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
