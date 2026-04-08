import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SyncButton } from "@/components/dashboard/sync-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-13 flex items-center justify-between border-b bg-white px-4 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <SyncButton />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
              {session.user.name?.[0] || "U"}
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
