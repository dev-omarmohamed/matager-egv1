import { NextResponse } from "next/server";
import { activateSubscription } from "@/lib/kashier-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, orderId, transactionId, callbackParams } = body;

    if (!storeId && !orderId) {
      return NextResponse.json(
        { success: false, error: "Either storeId or orderId is required." },
        { status: 400 }
      );
    }

    const result = await activateSubscription(storeId, orderId, {
      transactionId: transactionId || callbackParams?.transactionId || `TXN_${Date.now()}`,
      callbackParams: callbackParams || {},
      paidAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      activatedAt: result.activatedAt,
    });
  } catch (error: any) {
    console.error("Error activating subscription:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to activate subscription" },
      { status: 500 }
    );
  }
}
