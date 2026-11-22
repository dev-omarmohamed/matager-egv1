import { NextResponse } from "next/server";
import { buildStoreOwnerRTDBPayload } from "@/lib/rtdb-payload-builder";

const RTDB_BASE =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, token, storeConfig, storeData } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "Missing required 'uid' parameter" },
        { status: 400 }
      );
    }

    const resolvedConfig = storeConfig || storeData || {};
    const {
      storeNode,
      subscriptionNode,
      clientNode,
      shopperNode,
      multiPathPayload,
    } = buildStoreOwnerRTDBPayload({
      uid,
      ...resolvedConfig,
    });

    const storeId = storeNode.storeconfig.store_id;
    const authQuery = token ? `?auth=${encodeURIComponent(token)}` : "";

    // Method A: Atomic multi-path PATCH to root /.json
    let multiPathSuccess = false;
    try {
      const rootRes = await fetch(`${RTDB_BASE}/.json${authQuery}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(multiPathPayload),
      });
      if (rootRes.ok) {
        multiPathSuccess = true;
      }
    } catch (err) {
      console.warn("RTDB multi-path PATCH warning:", err);
    }

    // Method B: Dedicated endpoint writes for stores, subscription, client, shopper, and root fallback
    if (!multiPathSuccess) {
      await Promise.allSettled([
        // 1. stores/<uid>
        fetch(`${RTDB_BASE}/stores/${uid}.json${authQuery}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storeNode),
        }),
        // 2. subscription/<uid>
        fetch(`${RTDB_BASE}/subscription/${uid}.json${authQuery}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriptionNode),
        }),
        // 3. client/<uid>
        fetch(`${RTDB_BASE}/client/${uid}.json${authQuery}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientNode),
        }),
        // 4. shopper
        fetch(`${RTDB_BASE}/shopper.json${authQuery}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shopperNode),
        }),
        // 5. /<uid> (backward compatibility)
        fetch(`${RTDB_BASE}/${uid}.json${authQuery}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storeNode),
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      uid,
      storeId,
      databaseUrl: `${RTDB_BASE}/stores/${uid}`,
      stores: { [uid]: storeNode },
      subscription: { [uid]: subscriptionNode },
      client: { [uid]: clientNode },
      shopper: shopperNode,
    });
  } catch (err: any) {
    console.error("API /api/rtdb/push-store error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
