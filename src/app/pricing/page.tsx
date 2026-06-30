import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { CheckCircle2, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      interval: '/mo',
      description: 'Perfect for freelancers just getting started.',
      features: ['Up to 50 invoices/mo', 'Up to 20 clients', '1 Team Member', 'Standard Support'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$79',
      interval: '/mo',
      description: 'Everything you need for a growing agency.',
      features: ['Up to 500 invoices/mo', 'Up to 200 clients', '5 Team Members', 'Priority Support', 'Custom Branding'],
      popular: true
    },
    {
      name: 'Business',
      price: '$199',
      interval: '/mo',
      description: 'For established teams with high volume.',
      features: ['Unlimited invoices', 'Unlimited clients', 'Unlimited Team Members', '24/7 Dedicated Support', 'White-labeling'],
      popular: false
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">InvoiceOS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors text-primary" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Link href="/login" className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}>
            Get Started
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 py-20 lg:py-32 flex flex-col items-center">
        <div className="text-center mb-16 px-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no surprise charges. Pay for what you need, upgrade when you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-border/50'}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="h-10">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.interval}</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/login" className={buttonVariants({ variant: plan.popular ? 'default' : 'outline', size: 'lg', className: 'w-full' })}>
                  Start Free Trial
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 InvoiceOS Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
