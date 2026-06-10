import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export default async function ProfilPage() {
  const session = await requireAuth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Mein Profil"
        description={
          user.role === "ADMIN"
            ? "Bearbeiten Sie Ihre persönlichen Kontodaten."
            : "Bearbeiten Sie Ihr persönliches Profil. Alle anderen Bereiche sind nur zur Ansicht."
        }
      />
      <ProfileForm
        username={user.username}
        firstName={user.firstName}
        lastName={user.lastName}
      />
    </div>
  );
}
