import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Accounts — Local Theory · AutoPost",
};

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Brands and personas managed by AutoPost."
        actions={
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Add account
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="No accounts yet"
        description="Account creation arrives in Step 2 alongside platform OAuth flows."
      />
    </div>
  );
}
