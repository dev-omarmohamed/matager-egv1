import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, ...details } = body;

    // Simulate validation
    if (role === "employee" && !details.inviteCode) {
      return NextResponse.json(
        { error: "Valid store invite code is required" },
        { status: 400 }
      );
    }

    if (role === "owner" && (!details.storeName || !details.email)) {
      return NextResponse.json(
        { error: "Store name and email are required" },
        { status: 400 }
      );
    }

    // Artificial network delay for realistic feedback
    await new Promise((resolve) => setTimeout(resolve, 750));

    return NextResponse.json({
      success: true,
      message: "Account registered successfully",
      profile: {
        ...details,
        role,
        id: "usr_" + Math.random().toString(36).substring(2, 9),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
