import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { stripe } from '@/lib/stripe'

export default async function OnboardingSetupPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!session_id) {
    redirect('/onboarding/plan')
  }

  // Verify the Stripe Session
  let stripeSession
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id)
  } catch (err) {
    console.error('Invalid session_id', err)
    redirect('/onboarding/plan')
  }

  // Ensure this session belongs to the logged-in user
  if (stripeSession.client_reference_id !== user.id) {
    redirect('/onboarding/plan')
  }

  // Check if this subscription was already mapped to a business
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('stripe_subscription_id', stripeSession.subscription as string)
    .maybeSingle()

  if (existingBusiness) {
    redirect('/dashboard') // Already set up
  }

  async function completeSetup(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const website = formData.get('website') as string
    const taxId = formData.get('taxId') as string

    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) redirect('/login')

    // Use admin client to bypass RLS since users cannot insert into businesses
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Re-verify session in the action
    const sSession = await stripe.checkout.sessions.retrieve(session_id as string)
    
    // Create the business record
    const { data: business, error: bizError } = await adminClient
      .from('businesses')
      .insert({
        name,
        website: website || null,
        tax_id: taxId || null,
        stripe_customer_id: sSession.customer as string,
        stripe_subscription_id: sSession.subscription as string,
        subscription_status: 'active', // Safely assuming active right after checkout
        tier: 'starter', // We'll update this via webhook shortly when it fires
      })
      .select()
      .single()

    if (bizError || !business) {
      console.error(bizError)
      redirect('/onboarding/setup?error=Failed to create business')
    }

    // Assign the user as 'owner' using adminClient to bypass RLS
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({
        user_id: user.id,
        business_id: business.id,
        role: 'owner'
      })

    if (roleError) {
      console.error(roleError)
    }

    // Success! Redirect to Dashboard
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4 flex justify-center items-center">
      <Card className="max-w-md w-full shadow-lg border-border/50 backdrop-blur-sm bg-background/50">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl">Business Profile</CardTitle>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Step 2 of 2</span>
          </div>
          <CardDescription>
            Payment successful! Now, tell us about your business to finalize your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="setup-form" action={completeSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" required placeholder="Acme Corp, LLC" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input id="website" name="website" type="url" placeholder="https://acme.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / VAT (Optional)</Label>
              <Input id="taxId" name="taxId" placeholder="XX-XXXXXXX" />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button form="setup-form" type="submit" className="w-full">
            Complete Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
