import { NextResponse } from "next/server";

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

    const nowIso = new Date().toISOString();
    const thirtyDaysLater = new Date(Date.now() + 30 * 86400000).toISOString();
    const resolvedConfig = storeConfig || storeData || {};

    // 1. Prepare Store metadata
    const storeId = resolvedConfig.store_id || `store_${uid}`;
    const slug = (resolvedConfig.store_name || "store")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const plan = (
      resolvedConfig.subscription?.plan_id ||
      resolvedConfig.selected_plan ||
      resolvedConfig.plan ||
      "pro"
    ).toLowerCase();

    // Determine POS systems count per branch: starter = 1, pro = 2, enterprise = 4
    const branchPosCount =
      typeof resolvedConfig.pos_count === "number" && resolvedConfig.pos_count > 0
        ? resolvedConfig.pos_count
        : plan === "starter"
        ? 1
        : plan === "enterprise"
        ? 4
        : 2;

    const branchId = `branch_${storeId}_1`;

    // Build the POS systems map for this branch
    const posSystems: Record<string, any> = {};
    for (let i = 1; i <= branchPosCount; i++) {
      const termId = `pos_term_${i}`;
      posSystems[termId] = {
        branch_id: branchId,
        created_at: resolvedConfig.created_at || nowIso,
        device_serial: `POS-${1000 + i}`,
        id: termId,
        name: i === 1 ? "Register 1 (Main Cashier POS)" : `Register ${i} (Secondary / Floor POS)`,
        status: "Active",
        store_id: storeId,
        terminal_number: i,
        type: i === 1 ? "Countertop POS" : "Mobile / Floor POS",
      };
    }

    const defaultBranch = {
      address: resolvedConfig.address
        ? `${resolvedConfig.address}, ${resolvedConfig.city || "Cairo"}`
        : `${resolvedConfig.city || "Cairo"}, ${resolvedConfig.country || "Egypt"}`,
      city: resolvedConfig.city || "Cairo",
      country: resolvedConfig.country || "Egypt",
      created_at: resolvedConfig.created_at || nowIso,
      id: branchId,
      is_default: true,
      name: `${resolvedConfig.store_name || "My Store"} — Flagship Branch`,
      phone: resolvedConfig.phone || "",
      pos_count: branchPosCount,
      pos_systems: posSystems,
      status: "Active",
      store_id: storeId,
    };

    const branchesMap: Record<string, any> =
      resolvedConfig.branches &&
      typeof resolvedConfig.branches === "object" &&
      Object.keys(resolvedConfig.branches).length > 0
        ? resolvedConfig.branches
        : {
            [branchId]: defaultBranch,
          };

    // Calculate total POS count across all branches
    const totalPosCount = Object.values(branchesMap).reduce((acc: number, b: any) => {
      const count =
        typeof b?.pos_count === "number"
          ? b.pos_count
          : b?.pos_systems && typeof b.pos_systems === "object"
          ? Object.keys(b.pos_systems).length
          : branchPosCount;
      return acc + count;
    }, 0);

    const storeConfigPayload = {
      address: resolvedConfig.address || "",
      category: resolvedConfig.category || "clothing",
      city: resolvedConfig.city || "Cairo",
      client_type: "store_owner",
      country: resolvedConfig.country || "Egypt",
      created_at: resolvedConfig.created_at || nowIso,
      currency: resolvedConfig.currency || "EGP",
      email: resolvedConfig.email || "",
      expected_volume: resolvedConfig.expected_volume || "50 - 100 products",
      kyc_status: "Approved",
      legal_name: resolvedConfig.legal_name || resolvedConfig.store_name || "My Store LLC",
      owner_name: resolvedConfig.owner_name || resolvedConfig.store_name || "Store Owner",
      phone: resolvedConfig.phone || "",
      pos_count: totalPosCount,
      role: "store_owner",
      sales_channel: resolvedConfig.sales_channel || "hybrid",
      status: "Active",
      store_id: storeId,
      store_name: resolvedConfig.store_name || "My Store",
      subdomain: `${slug}.matager.com`,
      subscription: {
        currency: resolvedConfig.subscription?.currency || resolvedConfig.currency || "EGP",
        end_date: resolvedConfig.subscription?.end_date || thirtyDaysLater,
        plan_id: resolvedConfig.subscription?.plan_id || resolvedConfig.selected_plan || "pro",
        price: Number(resolvedConfig.subscription?.price) || Number(resolvedConfig.tier_price) || 570,
        start_date: resolvedConfig.subscription?.start_date || nowIso,
        status: "Active",
        volume_tier: resolvedConfig.subscription?.volume_tier || resolvedConfig.expected_volume || "50 - 100 products",
      },
      tier_price: Number(resolvedConfig.tier_price) || 570,
      uid: uid,
    };

    // ONLY push the node of the uid of the client with:
    // ├── branches (with pos_count, total, _initialized, and branch object)
    // ├── orders (empty initialized node)
    // ├── payments (empty initialized node)
    // ├── products (empty initialized node)
    // └── storeconfig (single node, no duplicate store-config)
    const userRootPayload = {
      branches: {
        _initialized: true,
        ...branchesMap,
        pos_count: totalPosCount,
        total: Object.keys(branchesMap).length,
      },
      orders: {
        _initialized: true,
        total: 0,
      },
      payments: {
        _initialized: true,
        total: 0,
      },
      products: {
        _initialized: true,
        total: 0,
      },
      storeconfig: storeConfigPayload,
    };

    // Push ONLY /{uid} to Firebase Realtime Database
    const userEndpoint = token
      ? `${RTDB_BASE}/${uid}.json?auth=${encodeURIComponent(token)}`
      : `${RTDB_BASE}/${uid}.json`;

    let rtdbUserResponse = await fetch(userEndpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userRootPayload),
    });

    if (!rtdbUserResponse.ok && token) {
      console.warn("RTDB user write with token failed, retrying direct write...");
      rtdbUserResponse = await fetch(`${RTDB_BASE}/${uid}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userRootPayload),
      });
    }

    if (!rtdbUserResponse.ok) {
      const errTxt = await rtdbUserResponse.text();
      console.error("Failed to push user node to Firebase RTDB:", errTxt);
      return NextResponse.json(
        { success: false, error: "Failed to write user node to RTDB", details: errTxt },
        { status: 502 }
      );
    }

    const userData = await rtdbUserResponse.json();

    return NextResponse.json({
      success: true,
      uid,
      storeId,
      databaseUrl: `${RTDB_BASE}/${uid}`,
      userNode: userRootPayload,
      rtdbResult: userData,
    });
  } catch (err: any) {
    console.error("API /api/rtdb/push-store error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
