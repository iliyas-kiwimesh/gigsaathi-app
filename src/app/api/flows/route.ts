import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://13.203.30.66:3000/flows");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json(
      { error: "Failed to fetch flows" },
      { status: 500 }
    );
  }
}
