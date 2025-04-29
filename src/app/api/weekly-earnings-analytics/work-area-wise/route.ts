import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";

interface WorkAreaWiseResponse {
  work_area: string;
  total_earnings: number;
  total_work_hours: number;
  average_earnings_per_hour: number;
  total_workers: number;
}

// Disable static rendering for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    // Validate date format if provided
    if (start_date && !isValidDate(start_date)) {
      return NextResponse.json(
        { error: "Invalid start_date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (end_date && !isValidDate(end_date)) {
      return NextResponse.json(
        { error: "Invalid end_date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Build query params
    const queryParams = new URLSearchParams();

    if (start_date) {
      queryParams.append("start_date", start_date);
    }
    if (end_date) {
      queryParams.append("end_date", end_date);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.WORK_AREA_WISE}${
        queryParams.toString() ? `?${queryParams}` : ""
      }`,
      {
        signal: controller.signal,
        cache: "no-store", // Disable caching for dynamic data
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: WorkAreaWiseResponse[] = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching work area analytics:", error);

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
            : "Failed to fetch work area analytics",
      },
      { status: 500 }
    );
  }
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
