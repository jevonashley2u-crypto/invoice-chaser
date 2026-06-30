import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get Business ID for the owner
    const { data: role } = await supabase
      .from('user_roles')
      .select('business_id, businesses(stripe_account_id)')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()

    if (!role) {
      return NextResponse.json({ error: 'No business found or not an owner' }, { status: 403 })
    }

    const businessId = role.business_id
    let stripeAccountId = (role.businesses as any)?.stripe_account_id

    // 3. Create Stripe Connect Account if one doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
      })
      stripeAccountId = account.id

      // Save it temporarily or permanently
      await supabase
        .from('businesses')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', businessId)
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // 4. Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/api/stripe/connect?businessId=${businessId}`, // Refresh triggers another POST or we can just redirect to settings
      return_url: `${origin}/api/stripe/connect/callback?businessId=${businessId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
