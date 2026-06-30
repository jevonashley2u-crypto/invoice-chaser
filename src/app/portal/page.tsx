import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Bot, CreditCard, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PortalPage() {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Find all client profiles associated with this authenticated user
  const { data: clientProfiles } = await supabase
    .from('clients')
    .select('id, name, business_id, businesses(name)')
    .eq('user_id', user.id)

  if (!clientProfiles || clientProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-muted/40 p-4 md:p-8 flex justify-center items-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Welcome to the Portal</CardTitle>
            <CardDescription>
              We couldn't find any client profiles linked to your account.
              If you believe this is an error, please contact the business that invited you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline">Sign Out</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clientIds = clientProfiles.map(c => c.id)

  // Fetch invoices for these client profiles
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, businesses(name)')
    .in('client_id', clientIds)
    .order('created_at', { ascending: false })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-5xl w-full flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-background p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            Client Portal
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm">Sign Out</Button>
            </form>
          </div>
        </div>

        <Card className="bg-background/50 backdrop-blur-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
            <CardDescription>Manage and pay your outstanding invoices here.</CardDescription>
          </CardHeader>
          <CardContent>
            {(!invoices || invoices.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>You have no invoices yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.businesses?.name}</TableCell>
                      <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(Number(invoice.total))}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/pay/${invoice.id}`}>
                            <Button size="sm" variant={invoice.status === 'paid' ? 'outline' : 'default'}>
                              {invoice.status === 'paid' ? 'View' : 'Pay Now'}
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
