"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "./ui/skeleton";

interface WorkAreaEarningsData {
  work_area: string;
  total_earnings: number;
  total_work_hours: number;
  average_earnings_per_hour: number;
  total_workers: number;
}

interface ErrorResponse {
  error: string;
}

export function WorkAreaEarnings() {
  const [data, setData] = useState<WorkAreaEarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/weekly-earnings-analytics/work-area-wise"
        );

        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }

        const result: WorkAreaEarningsData[] = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching work area earnings:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Area Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Work Area Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.map((area) => (
              <div
                key={area.work_area}
                className="border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{area.work_area}</h3>
                    <p className="text-sm text-muted-foreground">
                      {area.total_workers} worker{area.total_workers !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{area.total_earnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {area.total_work_hours} hours
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{Math.round(area.average_earnings_per_hour).toLocaleString()}/hour</span>
                  <span>₹{Math.round(area.total_earnings / area.total_workers).toLocaleString()}/worker</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
