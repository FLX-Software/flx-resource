import { Sidebar } from "@/components/layout/sidebar";
import { getSession, isAdmin } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <div className="flex h-full overflow-hidden bg-flx-bg">
      <Sidebar session={session} isAdmin={isAdmin(session)} />
      <main className="min-h-0 flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
