import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (!sig || !webhookSecret) return NextResponse.json({ error: 'Webhook Secret missing' }, { status: 400 })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Use a service role client to bypass RLS in the webhook
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Invoice Payment Handler
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    // Is this an end-client paying a business's invoice?
    if (session.metadata?.invoiceId) {
      const invoiceId = session.metadata.invoiceId
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)

      if (error) {
        console.error('Error updating invoice status:', error)
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 })
      }
      console.log(`Invoice ${invoiceId} marked as paid!`)
    }

    // Is this a SaaS Business subscribing to the platform?
    if (session.metadata?.businessId && session.mode === 'subscription') {
      const businessId = session.metadata.businessId
      const { error } = await supabase
        .from('businesses')
        .update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error linking subscription to business:', error)
      }
    }
  }

  // 2. SaaS Subscription Handlers
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    // Map the Price ID to our internal Tiers
    const priceId = subscription.items.data[0].price.id
    let tier = 'starter'
    // You would map your actual Stripe Price IDs here. E.g.:
    // if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = 'pro'
    // if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) tier = 'business'

    const { error } = await supabase
      .from('businesses')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        subscription_status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        tier: tier
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Error updating subscription status:', error)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    const { error } = await supabase
      .from('businesses')
      .update({
        subscription_status: 'canceled',
        tier: 'starter' // fallback or keep it, but limit them based on canceled status
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Error handling subscription deletion:', error)
    }
  }

  // 3. Connect Account Handlers
  if (event.type === 'account.updated') {
    const account = event.data.object as any
    // If the account can no longer accept charges, you might want to log it or notify the business
    // For now, we ensure the business is mapped
    const accountId = account.id
    const { error } = await supabase
      .from('businesses')
      .update({
        // we can store charges_enabled status if we add a column later
      })
      .eq('stripe_account_id', accountId)

    if (error) {
      console.error('Error updating connect account status:', error)
    }
  }

  return NextResponse.json({ received: true })
}
