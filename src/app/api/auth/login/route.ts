import { NextResponse } from "next/server";

// Hardcoded password for demonstration
const CORRECT_PASSWORD = "koimilgaya";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === CORRECT_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
