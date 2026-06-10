import Link from "next/link";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { UserAdminPanel } from "@/components/admin/user-admin-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEmployeesForUserLink, getUsersForAdmin } from "@/lib/auth-data";
import { requireAdmin } from "@/lib/session";

export default async function AdministrationPage() {
  const session = await requireAdmin();
  const [users, employees] = await Promise.all([
    getUsersForAdmin(),
    getEmployeesForUserLink(),
  ]);

  return (
    <div>
      <PageHeader
        title="Administration"
        description="Benutzerkonten verwalten, Rechte vergeben und Zugangsdaten einsehen."
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">Mitarbeiterprofile</p>
            <p className="text-sm text-flx-muted">
              Stammdaten, Skills und Verfügbarkeit der Mitarbeiter bearbeiten Sie unter
              Mitarbeiter.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/mitarbeiter">
              <Users className="h-4 w-4" />
              Zu Mitarbeiter
            </Link>
          </Button>
        </CardContent>
      </Card>

      <UserAdminPanel
        users={users}
        employees={employees}
        currentUserId={session.userId}
      />
    </div>
  );
}
