import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { stripe } from '@/lib/stripe'

export default async function OnboardingPlanPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // 2. Check if they already own a business. If so, they might already be onboarded.
  const { data: existingRoles } = await supabase
    .from('user_roles')
    .select('business_id, businesses(subscription_status)')
    .eq('user_id', user.id)
    .eq('role', 'owner')

  if (existingRoles && existingRoles.length > 0) {
    // Determine if already subscribed
    const business = existingRoles[0].businesses
    if ((business as any)?.subscription_status === 'active' || (business as any)?.subscription_status === 'trialing') {
      redirect('/dashboard') // Already fully onboarded
    }
  }

  // Define plans
  // Note: Replace these with your actual Stripe Price IDs from your dashboard
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      interval: '/mo',
      description: 'Perfect for freelancers just getting started.',
      features: ['Up to 50 invoices/mo', 'Up to 20 clients', '1 Team Member', 'Standard Support'],
      priceId: process.env.STRIPE_PRICE_STARTER || 'price_1Starter', // Placeholder
      popular: false
    },
    {
      name: 'Pro',
      price: '$79',
      interval: '/mo',
      description: 'Everything you need for a growing agency.',
      features: ['Up to 500 invoices/mo', 'Up to 200 clients', '5 Team Members', 'Priority Support', 'Custom Branding'],
      priceId: process.env.STRIPE_PRICE_PRO || 'price_1Pro', // Placeholder
      popular: true
    },
    {
      name: 'Business',
      price: '$199',
      interval: '/mo',
      description: 'For established teams with high volume.',
      features: ['Unlimited invoices', 'Unlimited clients', 'Unlimited Team Members', '24/7 Dedicated Support', 'White-labeling'],
      priceId: process.env.STRIPE_PRICE_BUSINESS || 'price_1Business', // Placeholder
      popular: false
    }
  ]

  // Server Action to create the checkout session using just the user_id
  async function selectPlan(formData: FormData) {
    'use server'
    const priceId = formData.get('priceId') as string
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) redirect('/login')

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/onboarding/setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/onboarding/plan`,
      client_reference_id: user.id, // Attach user ID so we can verify it later
      customer_email: user.email, // Pre-fill email
    })

    redirect(session.url as string)
  }

  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4 flex flex-col justify-center items-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Choose your plan</h1>
        <p className="text-muted-foreground text-lg">Select the tier that best fits your business needs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border/50'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="h-10">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.interval}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <form action={selectPlan} className="w-full">
                <input type="hidden" name="priceId" value={plan.priceId} />
                <Button type="submit" className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  Select {plan.name}
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
