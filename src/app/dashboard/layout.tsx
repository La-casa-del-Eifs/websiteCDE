import Sidebar from "@/components/dashboard/Sidebar";
import { getViewer } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, name } = await getViewer();

  return (
    <div className="flex min-h-screen flex-col bg-sand lg:flex-row">
      <Sidebar role={role} userName={name} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
