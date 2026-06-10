import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
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
          <CardTitle>Anmelden</CardTitle>
          <p className="text-sm text-flx-muted">FLX Resource – Fluck Holzbau</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
