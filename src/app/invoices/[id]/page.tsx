import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Mail, Copy, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, businesses(*), clients(*), invoice_items(*)')
    .eq('id', id)
    .single()

  if (!invoice) {
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 pb-10">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h1>
            <p className="text-muted-foreground mt-1">Manage, download, and send this invoice.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </Link>
            
            <form action={`/api/invoices/${invoice.id}/send`} method="POST">
              <Button type="submit">
                <Mail className="mr-2 h-4 w-4" />
                Send to Client
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Invoice Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{invoice.businesses.name}</CardTitle>
                </div>
                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div>
                  <h3 className="font-semibold text-muted-foreground mb-2">Billed To</h3>
                  <p className="font-medium text-lg">{invoice.clients.name}</p>
                  {invoice.clients.email && <p className="text-muted-foreground">{invoice.clients.email}</p>}
                  {invoice.clients.address && <p className="text-muted-foreground whitespace-pre-wrap">{invoice.clients.address}</p>}
                </div>
                <div className="text-right">
                  <p><span className="text-muted-foreground mr-2">Issue Date:</span> {new Date(invoice.issue_date).toLocaleDateString()}</p>
                  <p><span className="text-muted-foreground mr-2">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.invoice_items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(item.unit_price))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(item.total))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(Number(invoice.subtotal))}</span>
                  </div>
                  {Number(invoice.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(Number(invoice.tax))}</span>
                    </div>
                  )}
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-{formatCurrency(Number(invoice.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Due</span>
                    <span>{formatCurrency(Number(invoice.total))}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar Info Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Link</CardTitle>
                <CardDescription>Share this direct link with your client.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 bg-muted p-2 rounded-md overflow-hidden">
                  <code className="text-xs truncate flex-1 block">
                    {`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pay/${invoice.id}`}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client Portal</CardTitle>
                <CardDescription>Your client can view all their invoices directly in the portal.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/portal">
                  <Button variant="secondary" className="w-full">View Client Portal</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
