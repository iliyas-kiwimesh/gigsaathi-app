"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "./ui/skeleton";

interface GeneralAggregationsData {
  total_workers: number;
  total_earnings: number;
  average_earnings_per_hour: number;
  total_work_hours: number;
  total_work_areas: number;
}

interface ErrorResponse {
  error: string;
}

const DEFAULT_DATA: GeneralAggregationsData = {
  total_workers: 0,
  total_earnings: 0,
  average_earnings_per_hour: 0,
  total_work_hours: 0,
  total_work_areas: 0,
};

export function GeneralAggregations() {
  const [data, setData] = useState<GeneralAggregationsData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/weekly-earnings-analytics/general-aggregations"
        );

        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }

        const result: GeneralAggregationsData = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching general aggregations:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setData(DEFAULT_DATA);
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
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[150px] mb-2" />
              <Skeleton className="h-3 w-[200px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: data.total_workers.toLocaleString(),
      description: "Active users in the platform",
    },
    {
      title: "Total Earnings",
      value: `₹${data.total_earnings.toLocaleString()}`,
      description: "Cumulative earnings",
    },
    {
      title: "Average Weekly",
      value: `₹${Math.round(
        (data.average_earnings_per_hour * data.total_work_hours) / 7
      ).toLocaleString()}`,
      description: "Average earnings per week",
    },
    {
      title: "Active Areas",
      value: data.total_work_areas.toString(),
      description: "Number of active work areas",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
