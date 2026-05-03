import { Newspaper } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata = {
  title: "Sources — Local Theory · AutoPost",
};

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sources"
        description="Ingested raw material used to generate drafts."
      />
      <EmptyState
        icon={Newspaper}
        title="No sources yet"
        description="Ingestion of RSS, scrapers, and manual uploads arrives in Step 3."
      />
    </div>
  );
}
