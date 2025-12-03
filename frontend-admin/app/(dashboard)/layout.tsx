import { requireAdmin } from "@/utils/adminAuth";
import { DashboardSidebar } from "@/components";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This function handles all authentication and authorization server-side
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
