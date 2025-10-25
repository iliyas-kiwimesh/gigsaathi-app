import { NextRequest, NextResponse } from "next/server";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.gigsaathi.com";
const API_BASE_URL = "https://e3c2da320ab9.ngrok-free.app";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const store_location = searchParams.get("store_location");
    const mobile_number = searchParams.get("mobile_number");
    const start_date = searchParams.get("start_date");

    // Build query params
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    if (store_location) {
      queryParams.append("store_location", store_location);
    }
    if (mobile_number) {
      queryParams.append("mobile_number", mobile_number);
    }
    if (start_date) {
      queryParams.append("start_date", start_date);
    }

    const response = await fetch(`${API_BASE_URL}/flows?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch flows",
      },
      { status: 500 }
    );
  }
}
