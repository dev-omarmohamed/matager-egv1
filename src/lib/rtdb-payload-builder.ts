/**
 * RTDB Payload Builder for Matager Platform
 *
 * Constructs the canonical Firebase Realtime Database schema for Store Owners:
 * - stores/<uid>: Complete store node (branches, orders, payments, products, subscription, storeconfig)
 * - subscription/<uid>: Isolated subscription node with plan details and pricing
 * - client/<uid>: Isolated store owner identity and KYC details
 * - shopper: Global customer shopping directory initialized node
 * - <uid>: Root fallback node for backward-compatibility
 */

export interface BuildRTDBPayloadInput {
  uid: string;
  store_id?: string;
  store_name?: string;
  legal_name?: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  category?: string;
  country?: string;
  city?: string;
  address?: string;
  sales_channel?: "hybrid" | "online" | "pos";
  expected_volume?: string;
  tier_price?: number;
  currency?: string;
  pos_count?: number;
  created_at?: string;
  branches?: Record<string, any>;
  subscription?: {
    plan_id?: string;
    volume_tier?: string;
    price?: number;
    currency?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  };
  selected_plan?: string;
  plan?: string;
}

export interface RTDBStoreOwnerOutput {
  storeNode: any;
  subscriptionNode: any;
  clientNode: any;
  shopperNode: { _initialized: boolean };
  multiPathPayload: Record<string, any>;
}

export function buildStoreOwnerRTDBPayload(
  rawInput: BuildRTDBPayloadInput
): RTDBStoreOwnerOutput {
  const uid = rawInput.uid;
  const nowIso = rawInput.created_at || new Date().toISOString();
  const thirtyDaysLater = new Date(Date.now() + 30 * 86400000).toISOString();

  const storeId = rawInput.store_id || `store_${uid}`;
  const storeName = rawInput.store_name || "My Store";
  const legalName = rawInput.legal_name || storeName;
  const ownerName = rawInput.owner_name || storeName;
  const email = rawInput.email || "";
  const phone = rawInput.phone || "";
  const country = rawInput.country || "Egypt";
  const city = rawInput.city || "Cairo";
  const address = rawInput.address || "";
  const category = rawInput.category || "clothing";
  const salesChannel = rawInput.sales_channel || "hybrid";

  const slug = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "store";

  const plan = (
    rawInput.subscription?.plan_id ||
    rawInput.selected_plan ||
    rawInput.plan ||
    "enterprise"
  ).toLowerCase();

  const currency =
    rawInput.subscription?.currency ||
    rawInput.currency ||
    (country === "Saudi Arabia" ? "SAR" : country === "United Arab Emirates" ? "AED" : "EGP");

  const tierPrice =
    typeof rawInput.subscription?.price === "number"
      ? rawInput.subscription.price
      : typeof rawInput.tier_price === "number"
      ? rawInput.tier_price
      : 1500;

  const expectedVolume =
    rawInput.subscription?.volume_tier ||
    rawInput.expected_volume ||
    "300 - 550 products";

  // Determine POS systems count per branch: starter = 1, pro = 2, enterprise = 4
  const branchPosCount =
    typeof rawInput.pos_count === "number" && rawInput.pos_count > 0
      ? rawInput.pos_count
      : plan === "starter"
      ? 1
      : plan === "pro"
      ? 2
      : 4;

  const branchId = `branch_${storeId}_1`;

  // Build the POS systems map for this branch
  const posSystems: Record<string, any> = {};
  for (let i = 1; i <= branchPosCount; i++) {
    const termId = `pos_term_${i}`;
    posSystems[termId] = {
      branch_id: branchId,
      created_at: nowIso,
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
    address: address
      ? address.includes(city)
        ? address
        : `${address}, ${city}`
      : `${city}, ${country}`,
    city: city,
    country: country,
    created_at: nowIso,
    id: branchId,
    is_default: true,
    name: `${storeName} — Flagship Branch`,
    phone: phone,
    pos_count: branchPosCount,
    pos_systems: posSystems,
    status: "Active",
    store_id: storeId,
  };

  const branchesMap: Record<string, any> =
    rawInput.branches &&
    typeof rawInput.branches === "object" &&
    Object.keys(rawInput.branches).length > 0
      ? rawInput.branches
      : {
          [branchId]: defaultBranch,
        };

  const totalPosCount = Object.values(branchesMap).reduce((acc: number, b: any) => {
    const count =
      typeof b?.pos_count === "number"
        ? b.pos_count
        : b?.pos_systems && typeof b.pos_systems === "object"
        ? Object.keys(b.pos_systems).length
        : branchPosCount;
    return acc + count;
  }, 0);

  // 1. Subscription Node
  const subscriptionNode = {
    currency: currency,
    end_date: rawInput.subscription?.end_date || thirtyDaysLater,
    plan_id: plan,
    price: tierPrice,
    start_date: rawInput.subscription?.start_date || nowIso,
    status: "Active",
    store_id: storeId,
    uid: uid,
    volume_tier: expectedVolume,
  };

  // 2. Store Config Node
  const storeConfigNode = {
    address: defaultBranch.address,
    category: category,
    city: city,
    client_type: "store_owner",
    country: country,
    created_at: nowIso,
    currency: currency,
    email: email,
    expected_volume: expectedVolume,
    kyc_status: "Approved",
    legal_name: legalName,
    owner_name: ownerName,
    phone: phone,
    pos_count: totalPosCount,
    role: "store_owner",
    sales_channel: salesChannel,
    status: "Active",
    store_id: storeId,
    store_name: storeName,
    subdomain: `${slug}.matager.com`,
    tier_price: tierPrice,
    uid: uid,
  };

  // 3. Complete Store Node under stores/<uid>
  const storeNode = {
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
    subscription: {
      currency: subscriptionNode.currency,
      end_date: subscriptionNode.end_date,
      plan_id: subscriptionNode.plan_id,
      price: subscriptionNode.price,
      start_date: subscriptionNode.start_date,
      status: subscriptionNode.status,
      volume_tier: subscriptionNode.volume_tier,
    },
    storeconfig: storeConfigNode,
  };

  // 4. Client Node under client/<uid>
  const clientNode = {
    client_type: "store_owner",
    created_at: nowIso,
    email: email,
    kyc_status: "Approved",
    name: ownerName,
    phone: phone,
    role: "store_owner",
    status: "Active",
    store_id: storeId,
    uid: uid,
  };

  // 5. Shopper Node placeholder
  const shopperNode = {
    _initialized: true,
  };

  // Multi-path dictionary for atomic RTDB PATCH update
  const multiPathPayload: Record<string, any> = {
    [`stores/${uid}`]: storeNode,
    [`subscription/${uid}`]: subscriptionNode,
    [`client/${uid}`]: clientNode,
    [`shopper/_initialized`]: true,
    [`${uid}`]: storeNode, // Legacy root node fallback
  };

  return {
    storeNode,
    subscriptionNode,
    clientNode,
    shopperNode,
    multiPathPayload,
  };
}
