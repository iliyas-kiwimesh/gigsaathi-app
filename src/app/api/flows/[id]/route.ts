import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.gigsaathi.com";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Flow ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/flows/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting flow:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete flow",
      },
      { status: 500 }
    );
  }
}
