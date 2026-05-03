import { Activity, CheckCircle2, Clock, Send } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard — Local Theory · AutoPost",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of AutoPost activity across all accounts."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Posts today" value="—" hint="Across all platforms" icon={Send} />
        <StatCard label="Pending approvals" value="—" hint="Drafts awaiting review" icon={Clock} />
        <StatCard label="Auto-mode" value="Off" hint="Manual approvals required" icon={Activity} />
        <StatCard label="This week" value="—" hint="Total impressions" icon={CheckCircle2} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity yet. Once accounts are connected and the cron jobs run, recent ingests, drafts, and posts will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
