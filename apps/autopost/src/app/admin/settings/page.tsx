import { Settings } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata = {
  title: "Settings — Local Theory · AutoPost",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Global configuration for AutoPost."
      />
      <EmptyState
        icon={Settings}
        title="Nothing to configure yet"
        description="Voice profiles, posting windows, and platform credentials arrive in Step 2+."
      />
    </div>
  );
}
