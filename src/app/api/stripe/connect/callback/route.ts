import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.redirect(new URL('/settings?error=Missing+businessId', req.url))
    }

    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 2. Ensure they own this business
    const { data: role } = await supabase
      .from('user_roles')
      .select('businesses(stripe_account_id)')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .eq('role', 'owner')
      .single()

    if (!role || !(role.businesses as any)?.stripe_account_id) {
      return NextResponse.redirect(new URL('/settings?error=Unauthorized', req.url))
    }

    // 3. Verify Stripe Account Status
    // Ensure the business actually has a stripe_account_id
    const stripeAccountId = (role.businesses as any)?.stripe_account_id
    const account = await stripe.accounts.retrieve(stripeAccountId)

    if (account.details_submitted) {
      // Successfully onboarded
      return NextResponse.redirect(new URL('/settings?connect_success=true', req.url))
    } else {
      // Did not finish onboarding
      return NextResponse.redirect(new URL('/settings?error=Onboarding+incomplete', req.url))
    }
  } catch (error: any) {
    console.error('Stripe Connect Callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=Server+error', req.url))
  }
}
