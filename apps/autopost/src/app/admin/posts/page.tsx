import { Send } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata = {
  title: "Posts — Local Theory · AutoPost",
};

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts"
        description="History of published posts with engagement metrics."
      />
      <EmptyState
        icon={Send}
        title="No posts yet"
        description="Published posts will appear here once the publish cron runs in Step 5."
      />
    </div>
  );
}
