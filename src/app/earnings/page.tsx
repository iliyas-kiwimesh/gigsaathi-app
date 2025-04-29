import { EarningsDataTable } from "@/components/EarningsDataTable";

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Earnings</h1>
        <p className="text-muted-foreground">
          View and analyze weekly earnings data for all users.
        </p>
      </div>
      <EarningsDataTable />
    </div>
  );
}
