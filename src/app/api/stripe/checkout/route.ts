import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get Invoice details
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, businesses(stripe_account_id), invoice_items(*)')
      .eq('id', invoiceId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const stripeAccountId = invoice.businesses?.stripe_account_id

    if (!stripeAccountId) {
      return NextResponse.json({ error: 'This business has not connected a bank account to receive payments yet.' }, { status: 400 })
    }

    // Map invoice items to Stripe line items
    const line_items = invoice.invoice_items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.description,
        },
        unit_amount: Math.round(Number(item.unit_price) * 100), // convert to cents
      },
      quantity: Math.max(1, Math.round(Number(item.quantity))),
    }))

    // Handle tax
    if (Number(invoice.tax) > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: Math.round(Number(invoice.tax) * 100),
        },
        quantity: 1,
      })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Checkout Session using Stripe Connect
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/pay/${invoiceId}?success=true`,
      cancel_url: `${origin}/pay/${invoiceId}?canceled=true`,
      metadata: {
        invoiceId: invoiceId,
      },
    }, {
      stripeAccount: stripeAccountId, // Crucial: routes funds to the business's connected account
    })

    // Update invoice with session ID
    await supabase
      .from('invoices')
      .update({ notes: `${invoice.notes || ''}\n\nStripe Session: ${session.id}` })
      .eq('id', invoiceId)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
