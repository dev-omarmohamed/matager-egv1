import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RTDB_WHOLESALER_URL =
  "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app/requests/wholesaler.json";

// Simple in-memory sliding window rate limiter
const ipRequests = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  const current = ipRequests.get(ip);
  if (!current || now > current.expiresAt) {
    ipRequests.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, phone, locale, source, honeypot } = body;

    // Bot honeypot trap
    if (honeypot) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Name validation: 2 - 80 characters
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return NextResponse.json(
        { error: "Invalid name format (must be 2-80 characters)." },
        { status: 400 }
      );
    }

    // Phone validation: Egyptian or International
    const cleanPhone = (phone || "").replace(/[\s\-()]/g, "");
    const egyptianRegex = /^((\+20|0020)|0)?1[0125]\d{8}$/;
    const intlRegex = /^\+?[1-9]\d{7,14}$/;

    if (!cleanPhone || (!egyptianRegex.test(cleanPhone) && !intlRegex.test(cleanPhone))) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 }
      );
    }

    // Push to Firebase RTDB under /requests/wholesaler
    try {
      await fetch(RTDB_WHOLESALER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          locale: locale || "en",
          source: source || "landing_wholesaler_cta",
          createdAt: new Date().toISOString(),
          status: "pending",
        }),
      });
    } catch {
      // Silently catch RTDB error
    }

    // Forward to destination webhook if configured (without logging personal PII to server stdout)
    const webhookUrl = process.env.WHOLESALE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            phone: cleanPhone,
            locale: locale || "en",
            source: source || "landing",
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // Silently catch webhook dispatch failure
      }
    }

    return NextResponse.json({
      success: true,
      message: "Wholesale inquiry received successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}

