import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { ShieldAlert } from "lucide-react"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail || user.email !== adminEmail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8 border rounded-xl bg-background shadow-sm">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Unauthorized Access</h1>
          <p className="text-muted-foreground">
            You do not have permission to view the platform administration dashboard.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
