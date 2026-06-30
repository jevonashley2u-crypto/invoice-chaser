import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { priceId, businessId } = await req.json()
    if (!priceId || !businessId) {
      return NextResponse.json({ error: 'Missing priceId or businessId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get Business details
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Checkout Session
    let customerId = business.stripe_customer_id

    // If we don't have a customer ID yet, Stripe Checkout will create one,
    // and we will save it in the webhook handler.
    // Alternatively, we can create the customer right now:
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: business.name,
        metadata: {
          businessId: business.id
        }
      })
      customerId = customer.id
      
      // Update business with new customer ID
      await supabase
        .from('businesses')
        .update({ stripe_customer_id: customerId })
        .eq('id', business.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/onboarding/setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/onboarding/plan`,
      metadata: {
        businessId: business.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe billing checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
