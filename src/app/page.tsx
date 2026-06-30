import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">InvoiceOS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/pricing">
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
      <main className="flex-1">
        <section className="w-full py-24 lg:py-32 xl:py-48 flex justify-center text-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8">
              <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                The modern way to get paid
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                Invoicing that works <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">for your business.</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                Send professional invoices, collect payments globally with Stripe, and automate your follow-ups. Everything you need to run your service business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Link href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full" })}>
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-20 bg-muted/50 border-y flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to scale</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                We've built the perfect stack of tools so you can focus on doing great work, not chasing payments.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-3">
              {[
                {
                  title: "Stripe Connect",
                  description: "Money goes straight to your bank account. No holding periods, no platform liability.",
                  icon: Shield
                },
                {
                  title: "Automated Reminders",
                  description: "We automatically email your clients when payments are due or overdue.",
                  icon: Zap
                },
                {
                  title: "Advanced Reports",
                  description: "Track your MRR, outstanding balances, and client growth in real-time.",
                  icon: BarChart
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center space-y-4 rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
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
