import { FileText } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata = {
  title: "Drafts — Local Theory · AutoPost",
};

export default function DraftsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Drafts"
        description="AI-generated posts awaiting review and scheduling."
      />
      <EmptyState
        icon={FileText}
        title="No drafts yet"
        description="Drafts will appear here after the generation cron runs in Step 4."
      />
    </div>
  );
}
