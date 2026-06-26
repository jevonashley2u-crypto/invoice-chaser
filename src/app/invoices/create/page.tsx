import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/invoices/invoice-form'

export default async function CreateInvoicePage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name')

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground">Draft a new invoice to send to your client.</p>
          </div>
        </div>

        <InvoiceForm clients={clients || []} />
      </div>
    </AppLayout>
  )
}
