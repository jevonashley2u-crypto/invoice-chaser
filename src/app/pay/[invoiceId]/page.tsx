import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PayButton } from './pay-button'
import { Bot } from 'lucide-react'

export default async function PayInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { invoiceId } = await params
  const { success, canceled } = await searchParams
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, businesses(*), clients(*), invoice_items(*)')
    .eq('id', invoiceId)
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
    <div className="min-h-screen bg-muted/40 p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-3xl w-full flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Bot className="h-6 w-6 text-primary" />
            InvoiceOS AI
          </div>
          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            {invoice.status.toUpperCase()}
          </Badge>
        </div>

        {/* Success / Cancel messages */}
        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded-md border border-green-200">
            Payment successful! Thank you for your business.
          </div>
        )}
        {canceled && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md border border-yellow-200">
            Payment was canceled. You can try again below.
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{invoice.businesses.name}</CardTitle>
                <CardDescription className="mt-1">
                  Invoice {invoice.invoice_number}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Billed To</h3>
                <p className="font-medium">{invoice.clients.name}</p>
                {invoice.clients.email && <p className="text-sm text-muted-foreground">{invoice.clients.email}</p>}
                {invoice.clients.address && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.clients.address}</p>}
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
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end border-t pt-4">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {Number(invoice.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                {Number(invoice.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          {invoice.status !== 'paid' && invoice.businesses.stripe_account_id && (
            <CardFooter className="bg-muted/50 border-t p-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl">
              <div className="text-sm text-muted-foreground">
                Pay securely with credit card or ACH via Stripe.
              </div>
              <PayButton invoiceId={invoice.id} />
            </CardFooter>
          )}

          {invoice.status !== 'paid' && !invoice.businesses.stripe_account_id && (
            <CardFooter className="bg-yellow-50 border-t border-yellow-100 p-6 flex items-center justify-center text-yellow-800 rounded-b-xl">
              The business has not configured online payments yet.
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
