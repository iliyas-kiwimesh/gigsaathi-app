import { NextResponse } from "next/server";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";

interface GeneralAggregationsResponse {
  total_users: number;
  total_earnings: number;
  average_weekly_earnings: number;
  active_work_areas: number;
}

export const revalidate = 3600; // 1 hour in seconds

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.GENERAL_AGGREGATIONS}`,
      {
        signal: controller.signal,
        next: {
          revalidate: API_CONFIG.CACHE_TTL,
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: GeneralAggregationsResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching general aggregations:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch general aggregations",
      },
      { status: 500 }
    );
  }
}
