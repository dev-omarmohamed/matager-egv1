import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RTDB_STOREOWNERS_URL =
  "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app/requests/storeowners.json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, storeName, expectedProducts, email, notes, locale, honeypot } = body;

    // Bot honeypot trap
    if (honeypot) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Invalid name format (must be at least 2 characters)." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/[\s\-()]/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 }
      );
    }

    // Push to Firebase RTDB under /requests/storeowners
    const rtdbRes = await fetch(RTDB_STOREOWNERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        storeName: (storeName || "").trim(),
        phone: cleanPhone,
        email: (email || "").trim(),
        expectedProducts: (expectedProducts || "550+ products").trim(),
        notes: (notes || "").trim(),
        locale: locale || "en",
        source: "pricing_enterprise_request",
        createdAt: new Date().toISOString(),
        status: "pending",
      }),
    });

    if (!rtdbRes.ok) {
      // Return partial error or proceed
    }

    return NextResponse.json({
      success: true,
      message: "Store owner enterprise request received successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process store owner request." },
      { status: 500 }
    );
  }
}

