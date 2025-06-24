import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.gigsaathi.com";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const work_area = searchParams.get("work_area");
    const mobile_number = searchParams.get("mobile_number");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const primary_company = searchParams.get("primary_company");

    // Build query params
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    if (work_area?.trim()) {
      queryParams.append("work_area", work_area.trim());
    }
    if (mobile_number?.trim()) {
      queryParams.append("mobile_number", mobile_number.trim());
    }
    if (start_date) {
      queryParams.append("start_date", start_date);
    }
    if (end_date) {
      queryParams.append("end_date", end_date);
    }
    if (primary_company?.trim()) {
      queryParams.append("primary_company", primary_company.trim());
    }

    const response = await fetch(
      `${API_BASE_URL}/weekly-earnings/reports?${queryParams}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Ensure all required fields are present in the response
    const processedData = {
      ...data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data.data.map((item: any) => ({
        ...item,
        work_hours: item.work_hours || 0,
        earnings: item.earnings || 0,
        expenses: item.expenses || 0,
        primary_company: item.primary_company || "N/A",
        work_area: item.work_area || "N/A",
        screen_shot: item.screen_shot || null,
      })),
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error fetching weekly earnings:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch weekly earnings",
      },
      { status: 500 }
    );
  }
}
