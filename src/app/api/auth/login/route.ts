import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, role } = body;

    // Simulate authentication processing
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier and password are required" },
        { status: 400 }
      );
    }

    // Artificial network delay for realistic feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        identifier,
        role: role || "owner",
        token: "mtg_jwt_" + Math.random().toString(36).substring(2),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
