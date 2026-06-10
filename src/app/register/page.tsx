import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-flx-bg p-6">
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
            Erstellen Sie ein Mitarbeiter-Konto. Administrator-Zugänge werden vom
            Planer eingerichtet.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
