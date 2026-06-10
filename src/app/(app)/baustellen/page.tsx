import { PageHeader } from "@/components/layout/page-header";
import { SiteList } from "@/components/sites/site-list";
import { getSites } from "@/lib/data";
import { getSession, isAdmin } from "@/lib/session";

export default async function BaustellenPage() {
  const session = await getSession();
  const admin = isAdmin(session);
  const sites = await getSites();

  return (
    <div>
      <PageHeader
        title="Baustellen"
        description={
          admin
            ? "Verwalten Sie Ihre Baustellen und zugewiesene Ressourcen."
            : "Übersicht über Baustellen und zugewiesene Ressourcen."
        }
      />
      <SiteList sites={sites} isAdmin={admin} />
    </div>
  );
}
