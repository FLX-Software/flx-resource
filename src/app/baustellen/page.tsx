import { PageHeader } from "@/components/layout/page-header";
import { SiteList } from "@/components/sites/site-list";
import { getSites } from "@/lib/data";

export default async function BaustellenPage() {
  const sites = await getSites();

  return (
    <div>
      <PageHeader
        title="Baustellen"
        description="Verwalten Sie Ihre Baustellen und zugewiesene Ressourcen."
      />
      <SiteList sites={sites} />
    </div>
  );
}
