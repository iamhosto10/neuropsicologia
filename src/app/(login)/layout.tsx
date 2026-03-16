import Sidebar from "@/components/dashboard-layout/sidebar";
import Topbar from "@/components/dashboard-layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:block w-72 border-r border-slate-200 bg-white sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
