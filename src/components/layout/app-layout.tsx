import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { CopilotChat } from "@/components/ai/copilot-chat"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
        <AppSidebar />
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-0 flex-1">
        <AppHeader />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>

      {/* Global AI Copilot */}
      <CopilotChat />
    </div>
  )
}
