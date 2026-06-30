import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FilePlus, UserPlus, FileSpreadsheet, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="col-span-full lg:col-span-2 bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to speed up your workflow</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        <Link href="/invoices/create" className="group">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group-hover:-translate-y-1">
            <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
              <FilePlus className="h-5 w-5" />
            </div>
            <span className="font-semibold">New Invoice</span>
          </Button>
        </Link>
        <Link href="/clients" className="group">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group-hover:-translate-y-1">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="font-semibold">Add Client</span>
          </Button>
        </Link>
        <Link href="/reports" className="group">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group-hover:-translate-y-1">
            <div className="p-2 bg-purple-500/10 rounded-full text-purple-500 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="font-semibold">View Reports</span>
          </Button>
        </Link>
        <Link href="/settings" className="group">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-zinc-500/50 hover:bg-zinc-500/5 transition-all group-hover:-translate-y-1">
            <div className="p-2 bg-zinc-500/10 rounded-full text-zinc-500 group-hover:scale-110 transition-transform">
              <Settings className="h-5 w-5" />
            </div>
            <span className="font-semibold">Settings</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
