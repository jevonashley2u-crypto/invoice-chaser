import { login, signup } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const error = params.error as string | undefined;
  const message = params.message as string | undefined;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 items-center">
          <div className="flex items-center gap-2 font-bold text-xl mb-2">
            <Bot className="h-6 w-6" />
            InvoiceOS AI
          </div>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}
            {message && (
              <div className="text-sm text-green-500 font-medium">{message}</div>
            )}
            <div className="flex flex-col gap-2 mt-2">
              <button formAction={login} className={buttonVariants({ className: "w-full" })} type="submit">
                Sign In
              </button>
              <button formAction={signup} className={buttonVariants({ variant: "outline", className: "w-full" })} type="submit">
                Sign Up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
