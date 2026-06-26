import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
