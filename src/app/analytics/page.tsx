import { WorkAreaEarnings } from "@/components/WorkAreaEarnings";
import { GeneralAggregations } from "@/components/GeneralAggregations";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          View earnings analytics and general statistics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WorkAreaEarnings />
        <GeneralAggregations />
      </div>
    </div>
  );
}
