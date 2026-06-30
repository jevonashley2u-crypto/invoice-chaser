import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export async function requireBusinessSetup() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Check if they have a business role
  const { data: roles } = await supabase
    .from('user_roles')
    .select('business_id, role, businesses(subscription_status)')
    .eq('user_id', user.id)

  if (!roles || roles.length === 0) {
    redirect('/onboarding/plan')
  }

  // Optionally check subscription status to enforce active subscription
  const business = roles[0].businesses as any
  if (!business || (business.subscription_status !== 'active' && business.subscription_status !== 'trialing')) {
    redirect('/onboarding/plan')
  }

  return { user, businessId: roles[0].business_id, role: roles[0].role }
}
