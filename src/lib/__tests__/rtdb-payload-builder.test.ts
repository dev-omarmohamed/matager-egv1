import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStoreOwnerRTDBPayload } from "../rtdb-payload-builder";

test("buildStoreOwnerRTDBPayload creates exact top-level nodes and fields matching user specification", () => {
  const uid = "yVstqHuZh6dYiXUidMw5pbBvWr12";
  const now = "2026-11-13T18:51:34.671Z";

  const { storeNode, subscriptionNode, clientNode, shopperNode, multiPathPayload } =
    buildStoreOwnerRTDBPayload({
      uid,
      store_name: "hero",
      legal_name: "heroclothing",
      owner_name: "hero",
      email: "omarbussmo077@gmail.com",
      phone: "01010773587",
      category: "clothing",
      city: "Zagazig",
      country: "Egypt",
      address: "Zagazig - https://www.google.com/maps?q=30.591616,31.485935",
      sales_channel: "hybrid",
      expected_volume: "300 - 550 products",
      tier_price: 1500,
      selected_plan: "enterprise",
      pos_count: 4,
      created_at: now,
    });

  // 1. Verify stores/<uid> node
  assert.equal(storeNode.storeconfig.uid, uid);
  assert.equal(storeNode.storeconfig.store_name, "hero");
  assert.equal(storeNode.storeconfig.legal_name, "heroclothing");
  assert.equal(storeNode.storeconfig.owner_name, "hero");
  assert.equal(storeNode.storeconfig.email, "omarbussmo077@gmail.com");
  assert.equal(storeNode.storeconfig.phone, "01010773587");
  assert.equal(storeNode.storeconfig.role, "store_owner");
  assert.equal(storeNode.storeconfig.client_type, "store_owner");
  assert.equal(storeNode.storeconfig.sales_channel, "hybrid");
  assert.equal(storeNode.storeconfig.category, "clothing");
  assert.equal(storeNode.storeconfig.status, "Active");
  assert.equal(storeNode.storeconfig.kyc_status, "Approved");
  assert.equal(storeNode.storeconfig.expected_volume, "300 - 550 products");
  assert.equal(storeNode.storeconfig.tier_price, 1500);
  assert.equal(storeNode.storeconfig.currency, "EGP");
  assert.equal(storeNode.storeconfig.subdomain, "hero.matager.com");
  assert.equal(storeNode.storeconfig.pos_count, 4);

  // 2. Verify branches and POS systems
  assert.equal(storeNode.branches._initialized, true);
  assert.equal(storeNode.branches.total, 1);
  assert.equal(storeNode.branches.pos_count, 4);

  const branchKey = `branch_store_${uid}_1`;
  const branch = storeNode.branches[branchKey];
  assert.ok(branch, "Default branch must exist");
  assert.equal(branch.id, branchKey);
  assert.equal(branch.is_default, true);
  assert.equal(branch.status, "Active");
  assert.equal(branch.pos_count, 4);
  assert.equal(Object.keys(branch.pos_systems).length, 4);
  assert.equal(branch.pos_systems.pos_term_1.device_serial, "POS-1001");
  assert.equal(branch.pos_systems.pos_term_2.device_serial, "POS-1002");
  assert.equal(branch.pos_systems.pos_term_3.device_serial, "POS-1003");
  assert.equal(branch.pos_systems.pos_term_4.device_serial, "POS-1004");

  // 3. Verify orders, payments, products initialized nodes
  assert.equal(storeNode.orders._initialized, true);
  assert.equal(storeNode.orders.total, 0);
  assert.equal(storeNode.payments._initialized, true);
  assert.equal(storeNode.payments.total, 0);
  assert.equal(storeNode.products._initialized, true);
  assert.equal(storeNode.products.total, 0);

  // 4. Verify subscription inside stores/<uid>
  assert.equal(storeNode.subscription.status, "Active");
  assert.equal(storeNode.subscription.plan_id, "enterprise");
  assert.equal(storeNode.subscription.price, 1500);
  assert.equal(storeNode.subscription.currency, "EGP");
  assert.equal(storeNode.subscription.volume_tier, "300 - 550 products");

  // 5. Verify isolated subscription/<uid> node
  assert.equal(subscriptionNode.uid, uid);
  assert.equal(subscriptionNode.store_id, `store_${uid}`);
  assert.equal(subscriptionNode.status, "Active");
  assert.equal(subscriptionNode.plan_id, "enterprise");
  assert.equal(subscriptionNode.price, 1500);
  assert.equal(subscriptionNode.volume_tier, "300 - 550 products");

  // 6. Verify isolated client/<uid> node
  assert.equal(clientNode.uid, uid);
  assert.equal(clientNode.store_id, `store_${uid}`);
  assert.equal(clientNode.client_type, "store_owner");
  assert.equal(clientNode.role, "store_owner");
  assert.equal(clientNode.status, "Active");
  assert.equal(clientNode.kyc_status, "Approved");
  assert.equal(clientNode.email, "omarbussmo077@gmail.com");
  assert.equal(clientNode.phone, "01010773587");
  assert.equal(clientNode.name, "hero");

  // 7. Verify shopper node
  assert.equal(shopperNode._initialized, true);

  // 8. Verify multiPathPayload dictionary
  assert.ok(multiPathPayload[`stores/${uid}`]);
  assert.ok(multiPathPayload[`subscription/${uid}`]);
  assert.ok(multiPathPayload[`client/${uid}`]);
  assert.equal(multiPathPayload["shopper/_initialized"], true);
  assert.ok(multiPathPayload[uid]);
});
