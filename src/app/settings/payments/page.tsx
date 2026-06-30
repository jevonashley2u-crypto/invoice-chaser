import { createClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectStripeButton } from './connect-button'
import { CheckCircle2 } from 'lucide-react'
import { requireBusinessSetup } from '@/lib/onboarding'

export default async function PaymentsSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string, connect_success?: string }> }) {
  const { error, connect_success } = await searchParams
  
  const { businessId } = await requireBusinessSetup()
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('stripe_account_id')
    .eq('id', businessId)
    .single()

  const isConnected = !!business?.stripe_account_id

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments Settings</h1>
          <p className="text-muted-foreground">Manage how your business gets paid.</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md border border-destructive/50 text-sm">
            {error}
          </div>
        )}

        {connect_success === 'true' && (
          <div className="bg-green-500/15 text-green-600 p-3 rounded-md border border-green-500/50 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Successfully connected to Stripe!
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Accept Payments with Stripe</CardTitle>
            <CardDescription>
              Connect your bank account to allow clients to pay your invoices directly via credit card or ACH.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                <span>Stripe Account Connected</span>
              </div>
            ) : (
              <ConnectStripeButton />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
