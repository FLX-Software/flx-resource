import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUnlinkedEmployees } from "@/lib/auth-actions";

export default async function RegisterPage() {
  const employees = await getUnlinkedEmployees();
  const requiresAdminSecret = Boolean(process.env.ADMIN_REGISTRATION_SECRET);

  return (
    <div className="flex min-h-full items-center justify-center bg-flx-bg p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Image
            src="/flx-logo.png"
            alt="FLX Software"
            width={160}
            height={56}
            className="mb-2 h-12 w-auto"
            priority
          />
          <CardTitle>Konto erstellen</CardTitle>
          <p className="text-sm text-flx-muted">
            Mitarbeiter sehen nur ihre Einsätze. Planer verwalten alles.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm employees={employees} requiresAdminSecret={requiresAdminSecret} />
        </CardContent>
      </Card>
    </div>
  );
}
