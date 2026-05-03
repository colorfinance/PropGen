import { Sidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-5">
          <span className="text-sm font-semibold tracking-tight">
            Local Theory
            <span className="ml-2 text-muted-foreground">·</span>
            <span className="ml-2 font-normal text-muted-foreground">AutoPost</span>
          </span>
        </div>
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <span className="text-sm font-semibold tracking-tight md:hidden">
            Local Theory · AutoPost
          </span>
          <div className="ml-auto flex items-center gap-2">
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
