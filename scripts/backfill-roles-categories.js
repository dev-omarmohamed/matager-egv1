/**
 * One-time backfill migration script for Matager RTDB
 *
 * Backfills existing stores without a category to default category: "general-retail"
 * Backfills existing users without a role to default role: "merchant"
 *
 * Usage:
 *   node scripts/backfill-roles-categories.js [--seed-only]
 */

const fs = require("fs");
const path = require("path");

const seedPath = path.join(__dirname, "../firebase-rtdb-seed.json");

function backfillSeedFile() {
  console.log(`[Backfill] Reading seed database: ${seedPath}`);
  if (!fs.existsSync(seedPath)) {
    console.error(`[Backfill] Seed file not found at ${seedPath}`);
    return;
  }

  const raw = fs.readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw);

  let updatedStores = 0;
  let updatedUsers = 0;

  // 1. Backfill stores
  if (data.stores) {
    for (const [storeId, store] of Object.entries(data.stores)) {
      if (!store.category) {
        store.category = "general-retail";
        updatedStores++;
        console.log(`[Backfill] Assigned store ${storeId} -> category: "general-retail"`);
      }
    }
  }

  // 2. Backfill users
  if (!data.users) {
    data.users = {};
  }

  if (data.stores) {
    for (const [storeId, store] of Object.entries(data.stores)) {
      const ownerId = store.owner_id;
      if (ownerId && !data.users[ownerId]) {
        data.users[ownerId] = { role: "merchant" };
        updatedUsers++;
        console.log(`[Backfill] Initialized user ${ownerId} -> role: "merchant"`);
      } else if (ownerId && !data.users[ownerId].role) {
        data.users[ownerId].role = "merchant";
        updatedUsers++;
        console.log(`[Backfill] Updated user ${ownerId} -> role: "merchant"`);
      }
    }
  }

  fs.writeFileSync(seedPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[Backfill] Completed: ${updatedStores} stores, ${updatedUsers} users backfilled successfully.`);
}

backfillSeedFile();

