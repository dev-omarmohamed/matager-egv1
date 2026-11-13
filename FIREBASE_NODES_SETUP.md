# Firebase Services & Realtime Database Nodes Setup Guide

This guide details all configuration, services, security rules, and database nodes required to run the **Matager** platform with project **`matager-egv01`**.

---

## 1. Firebase Project Overview

* **Project ID:** `matager-egv01`
* **Auth Domain:** `matager-egv01.firebaseapp.com`
* **Realtime Database URL:** `https://matager-egv01-default-rtdb.firebaseio.com`
* **Storage Bucket:** `matager-egv01.firebasestorage.app`
* **Messaging Sender ID:** `789251938163`
* **Web App ID:** `1:789251938163:web:9bff4eff91f73abfb61706`
* **Analytics Measurement ID:** `G-77YTXR85KB`

---

## 2. Firebase Services Setup in Console

Open [Firebase Console](https://console.firebase.google.com/) and navigate to project **`matager-egv01`**:

### A. Authentication
1. Go to **Build** &rarr; **Authentication** &rarr; **Sign-in method**.
2. Enable **Email/Password**:
   - Click *Email/Password* &rarr; toggle **Enable** &rarr; click **Save**.
3. Enable **Anonymous**:
   - Click *Anonymous* &rarr; toggle **Enable** &rarr; click **Save** (required for guest checkout in FastCart and offline onboarding).

### B. Realtime Database
1. Go to **Build** &rarr; **Realtime Database** &rarr; click **Create Database**.
2. Select your preferred database location (e.g., `United States (us-central1)` or `Belgium (europe-west1)`).
3. Choose **Start in locked mode** (we will apply custom rules next).
4. If your database URL is in a regional location other than `us-central1`, update `NEXT_PUBLIC_FIREBASE_DATABASE_URL` in `.env.local` to match the exact URL shown in the console.

### C. Cloud Storage
1. Go to **Build** &rarr; **Storage** &rarr; click **Get Started**.
2. Choose **Start in production mode**.
3. Confirm the default bucket: `matager-egv01.firebasestorage.app`.

### D. Google Analytics
1. Already connected with measurement ID `G-77YTXR85KB`.
2. Telemetry and page events are initialized automatically in browser environments.

---

## 3. Realtime Database (RTDB) Security Rules

In Firebase Console &rarr; **Realtime Database** &rarr; **Rules** tab, paste the following rules (also located in `database.rules.json`) and click **Publish**:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "stores": {
      ".read": true,
      "$storeId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'admin')",
        "role": {
          ".write": "auth != null && (auth.uid === $uid && !data.exists() || root.child('users/' + auth.uid + '/role').val() === 'admin')"
        }
      }
    },
    "$uid": {
      ".read": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'admin')",
      ".write": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'admin')"
    },
    "clients": {
      ".read": true,
      "$clientId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "customers": {
      "$storeId": {
        ".read": "auth != null",
        ".write": true
      }
    },
    "wholesalers": {
      "$wid": {
        ".read": "auth != null && (root.child('users/' + auth.uid + '/role').val() === 'admin' || root.child('users/' + auth.uid + '/role').val() === 'wholesaler' && auth.uid === $wid || root.child('stores/' + auth.uid + '/category').val() != null && (root.child('stores/' + auth.uid + '/linkedWholesalers/' + $wid).exists() || root.child('wholesalers/' + $wid + '/profile/categories').hasChild(root.child('stores/' + auth.uid + '/category').val())))",
        "profile": {
          ".write": "root.child('users/' + auth.uid + '/role').val() === 'wholesaler' && auth.uid === $wid"
        },
        "products": {
          ".write": "root.child('users/' + auth.uid + '/role').val() === 'wholesaler' && auth.uid === $wid"
        }
      }
    },
    "wholesalerInquiries": {
      "$inquiryId": {
        ".read": "auth != null && (data.child('storeId').val() === auth.uid || data.child('wholesalerId').val() === auth.uid || root.child('users/' + auth.uid + '/role').val() === 'admin')",
        ".write": "auth != null && (!data.exists() || data.child('wholesalerId').val() === auth.uid || root.child('users/' + auth.uid + '/role').val() === 'admin')"
      }
    },
    "products": {
      "$storeId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "categories": {
      "$storeId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "branches": {
      "$storeId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "pos_terminals": {
      "$storeId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "pos_ledger": {
      "$storeId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "orders": {
      "$storeId": {
        ".read": "auth != null",
        ".write": true
      }
    },
    "order_items": {
      "$storeId": {
        ".read": "auth != null",
        ".write": true
      }
    },
    "subscriptions": {
      "$storeId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "promo_codes": {
      "$storeId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 4. Realtime Database Nodes Specification

To run all modules (Storefront, FastCart, Cashier POS, Merchant Dashboard, and Super Admin), the following JSON node hierarchy is used in Firebase Realtime Database:

```
root (/)
├── {uid}/                          <-- Store Owner Root Container (Exclusively created via /api/rtdb/push-store)
│   ├── branches/                   <-- Initialized branches node with Flagship Branch, pos_count, and pos_systems
│   ├── orders/                     <-- Initialized empty node ({ _initialized: true, total: 0 })
│   ├── payments/                   <-- Initialized empty node ({ _initialized: true, total: 0 })
│   ├── products/                   <-- Initialized empty node ({ _initialized: true, total: 0 })
│   └── storeconfig/                <-- Store Profile, Role ('store_owner'), CreatedAt, Subscription (Single Node)
├── customers/                      <-- External Customers Node (End buyers from Storefront & POS)
│   └── {storeId}/
│       └── {customerId}/
├── stores/
│   └── {storeId}/
├── users/
│   └── {uid}/
├── categories/
│   └── {storeId}/
│       └── {categoryId}/
├── products/
│   └── {storeId}/
│       └── {productId}/
├── branches/
│   └── {storeId}/
│       └── {branchId}/
├── pos_terminals/
│   └── {storeId}/
│       └── {terminalId}/
├── orders/
│   └── {storeId}/
│       └── {orderId}/
├── order_items/
│   └── {storeId}/
│       └── {orderId}/
│           └── {itemId}/
├── pos_ledger/
│   └── {storeId}/
│       └── {orderId}/
├── subscriptions/
│   └── {storeId}/
└── promo_codes/
    └── {storeId}/
        └── {codeId}/
```

### Detailed Node Schemas

#### 0. `/{uid}` (Store Owner Root Account Node)
Exclusively created upon store owner registration via `POST /api/rtdb/push-store`:
* **`branches`** *(object)*: Initialized branches container containing the store's Flagship Branch (`{ _initialized: true, total: 1, pos_count: 2, [branchId]: { ... } }`).
  * **`pos_count`** *(number)*: How many POS systems are deployed in the branch.
  * **`pos_systems`** *(object)*: Detailed POS registers map (`pos_term_1`, `pos_term_2`, etc.).
* **`orders`** *(object)*: Initialized empty container (`{ _initialized: true, total: 0 }`) for customer orders.
* **`payments`** *(object)*: Initialized empty container (`{ _initialized: true, total: 0 }`) for incoming transactions.
* **`products`** *(object)*: Initialized empty container (`{ _initialized: true, total: 0 }`) ready for catalog items.
* **`storeconfig`** *(object)*: Single store configuration node (no duplicate `store-config`):
  * **`store_id`** *(string)*: Unique store identifier (`store_${uid}`).
  * **`uid`** *(string)*: Store owner's Firebase Authentication UID.
  * **`store_name`** *(string)*: Display name of the store.
  * **`legal_name`** *(string)*: Legal entity / corporate company name.
  * **`owner_name`** *(string)*: Owner display name.
  * **`email`** *(string)*: Owner contact email.
  * **`phone`** *(string)*: Owner contact phone number.
  * **`role`** *(string)*: `"store_owner"`.
  * **`client_type`** *(string)*: `"store_owner"`.
  * **`sales_channel`** *(string)*: `"hybrid" | "online" | "pos"`.
  * **`category`** *(string)*: Selected commercial store category (e.g. `clothing`).
  * **`expected_volume`** *(string)*: Monthly catalog expectation (e.g. `50 - 100 products`).
  * **`tier_price`** *(number)*: Tier monthly subscription price (e.g. `570`).
  * **`currency`** *(string)*: Default country currency code (e.g. `EGP`, `SAR`, `AED`).
  * **`country`** *(string)*: Selected Arab / Middle East country.
  * **`city`** / **`address`** *(string)*: Location details.
  * **`status`** *(string)*: `"Active"`.
  * **`kyc_status`** *(string)*: `"Approved"`.
  * **`subdomain`** *(string)*: Direct storefront subdomain routing.
  * **`pos_count`** *(number)*: Total POS systems.
  * **`created_at`** *(string)*: ISO timestamp of account creation.
  * **`subscription`** *(object)*:
    * **`plan_id`** *(string)*: Mapped plan (`"starter" | "pro" | "enterprise"`).
    * **`volume_tier`** *(string)*: Volume tier name.
    * **`price`** *(number)*: Monthly price.
    * **`currency`** *(string)*: Currency code.
    * **`status`** *(string)*: `"Active"`.
    * **`start_date`** / **`end_date`** *(string)*: 30-day billing cycle dates.

#### 1. `/clients/{uid}` (External Clients Node — Store Owners)
Store owners subscribing to and running shops on the Matager platform are called **clients**.
* **`client_id`** *(string)*: Client unique identifier (`uid`).
* **`uid`** *(string)*: Firebase Auth UID of the store owner.
* **`role`** *(string)*: `"client"`.
* **`client_type`** *(string)*: `"store_owner"`.
* **`client_name`** *(string)*: Client / Owner name.
* **`store_name`** *(string)*: Store name.
* **`legal_name`** *(string)*: Corporate registered company name.
* **`store_id`** *(string)*: Associated store ID (`store_${uid}`).
* **`email`** *(string)*: Client business email.
* **`phone`** *(string)*: Client phone number.
* **`category`** *(string)*: Primary store category.
* **`sales_channel`** *(string)*: Business channel strategy (`"hybrid" | "online" | "pos"`).
* **`expected_volume`** *(string)*: Monthly catalog expectation.
* **`tier_price`** *(number)*: Monthly subscription tier price.
* **`currency`** *(string)*: Country currency (e.g. `EGP`, `SAR`, `AED`).
* **`country`** / **`city`** / **`address`** *(string)*: Location details.
* **`status`** *(string)*: `"Active"`.
* **`kyc_status`** *(string)*: `"Approved"`.
* **`subdomain`** *(string)*: Subdomain address.
* **`created_at`** *(string)*: Registration timestamp.
* **`subscription`** *(object)*: Plan ID, volume tier, price, currency, start/end date.

#### 2. `/customers/{storeId}/{customerId}` (External Customers Node — Shoppers & Cashier Buyers)
End users who purchase goods through the online storefront or POS terminal registers are called **customers**.
* **`customer_id`** *(string)*: Unique customer identifier.
* **`store_id`** *(string)*: Associated store identifier.
* **`name`** *(string)*: Full name of the customer.
* **`email`** *(string)*: Customer email address.
* **`phone`** *(string)*: Customer phone number.
* **`channel`** *(string)*: Purchase source (`"web_storefront" | "pos_terminal"`).
* **`total_orders`** *(number)*: Count of completed orders.
* **`total_spent`** *(number)*: Lifetime spending amount in store currency.
* **`created_at`** *(string)*: Customer registration or first-purchase timestamp.

#### 3. `/stores/{storeId}`
Stores profile, branding, physical branch topology, and billing status for each tenant.
* **`id`** *(string)*: Store unique identifier (e.g. `peacock_store`).
* **`name`** *(string)*: Display name (e.g. `Peacock Store`).
* **`subdomain`** *(string)*: Subdomain routing slug (e.g. `peacock.matager.com`).
* **`owner_id`** *(string)*: UID reference of owner in `/users/{uid}`.
* **`client_id`** *(string)*: UID reference of client in `/clients/{uid}`.
* **`category`** *(string)*: Primary store category (e.g. `clothing`).
* **`city`** / **`country`** / **`address`** *(string)*: Store location.
* **`currency`** *(string)*: Base currency (e.g. `EGP`, `SAR`, `USD`).
* **`status`** *(string)*: `"Active" | "Trial" | "Past Due" | "Suspended" | "Pending"`.
* **`kyc_status`** *(string)*: `"Approved" | "Pending" | "Rejected"`.
* **`sales_channel`** *(string)*: `"hybrid" | "online" | "pos"`.
* **`plan`** *(string)*: Subscription tier (`"starter" | "pro" | "enterprise"`).
* **`pos_count`** *(number)*: Total active POS systems operating across all store branches.
* **`branches`** *(object)*: **Branches directly embedded inside the store record itself:**
  * **`{branchId}`** *(object)*:
    * **`id`** *(string)*: Branch ID (e.g. `branch_store_123_1`).
    * **`store_id`** *(string)*: Parent store ID.
    * **`name`** *(string)*: Branch name (e.g. `Cairo Silk Emporium — Flagship Branch`).
    * **`address`** *(string)*: Branch street address.
    * **`city`** / **`country`** *(string)*: Branch city and country.
    * **`phone`** *(string)*: Contact phone number.
    * **`status`** *(string)*: `"Active"`.
    * **`is_default`** *(boolean)*: `true`.
    * **`pos_count`** *(number)*: **How many POS systems are deployed in this specific branch** (e.g. `2`).
    * **`pos_systems`** *(object)*: Map of hardware / cash registers in this branch:
      * **`pos_term_1`**: `{ id, terminal_number, name, device_serial, status, type, created_at }`
      * **`pos_term_2`**: `{ id, terminal_number, name, device_serial, status, type, created_at }`
    * **`created_at`** *(string)*: Branch registration timestamp.
* **`created_at`** *(string)*: Store registration ISO timestamp.

#### 2. `/products/{storeId}/{productId}`
Catalog of items available in the storefront and POS terminal.
* **`id`** *(string)*: Product ID (e.g. `PEA_001`).
* **`title`** *(string)*: Item title.
* **`brand`** *(string)*: Brand name.
* **`category`** *(string)*: Category slug (`Apparel`, `Footwear`, `Accessories`).
* **`price`** *(number)*: Current retail selling price.
* **`originalPrice`** *(number, optional)*: Before-discount price.
* **`discountPercent`** *(number, optional)*: Discount percentage.
* **`stock`** *(number)*: Remaining available stock.
* **`image`** *(string)*: Primary image URL.
* **`currency`** *(string)*: Price currency.
* **`badge`** *(string, optional)*: Promotional badge (`"50% OFF"`, `"BEST SELLER"`).

#### 3. `/categories/{storeId}/{categoryId}`
Category navigation for store browsing.
* **`id`** *(string)*: Category identifier.
* **`name`** *(string)*: Display name.
* **`slug`** *(string)*: URL slug.
* **`level`** *(number)*: Hierarchy depth (1 = top-level).
* **`is_active`** *(boolean)*: Active status flag.

#### 4. `/branches/{storeId}/{branchId}`
Physical retail outlets and warehouse hubs.
* **`id`** *(string)*: Branch ID (e.g. `branch_01`).
* **`store_id`** *(string)*: Parent store ID.
* **`name`** *(string)*: Branch name (e.g. `Cairo Heliopolis Flagship`).
* **`address`** *(string)*: Physical street address.
* **`phone`** *(string)*: Branch phone number.
* **`status`** *(string)*: `"Active" | "Inactive"`.

#### 5. `/pos_terminals/{storeId}/{terminalId}`
Hardware registers and cashier terminals.
* **`id`** *(string)*: Terminal ID (`TERM-01`, `TERM-02`, etc.).
* **`name`** *(string)*: Name (`Main Register 01`).
* **`branch`** *(string)*: Assigned branch name.
* **`staffName`** *(string)*: Assigned cashier name.
* **`pin`** *(string)*: 4-digit PIN for cashier login (`1234`).
* **`status`** *(string)*: `"Active" | "Break" | "Offline"`.
* **`todaySales`** *(number)*: Accumulated sales for the current shift.
* **`todayOrders`** *(number)*: Order count for the current shift.
* **`lastActive`** *(string)*: Relative last activity timestamp.

#### 6. `/orders/{storeId}/{orderId}`
Online checkout orders and in-store cashier sales.
* **`id`** *(string)*: Order ID (e.g. `ord_1730000000` or `POS-842109`).
* **`store_id`** *(string)*: Store identifier.
* **`amount`** *(number)*: Total paid amount.
* **`commission_earned`** *(number)*: Platform fee.
* **`gateway_fee`** *(number)*: Payment processing fee.
* **`status`** *(string)*: `"Completed" | "Pending" | "Failed" | "Cancelled"`.
* **`type`** *(string)*: `"Order"`.
* **`channel`** *(string)*: `"Online" | "POS"`.
* **`payment_method`** *(string)*: `"Card" | "Cash" | "Wallet" | "Mada"`.
* **`customer_name`** *(string)*: Customer name or `"Walk-in Guest"`.
* **`customer_phone`** *(string)*: Phone number.
* **`shipping_address`** *(string)*: Delivery address or pickup note.
* **`items_count`** *(number)*: Total units purchased.
* **`created_at`** *(string)*: ISO timestamp.

#### 7. `/order_items/{storeId}/{orderId}/{itemId}`
Granular line items for receipts and fulfillment.
* **`id`** *(string)*: Item row ID.
* **`transaction_id`** *(string)*: Parent order ID.
* **`product_id`** *(string)*: Product ID reference.
* **`name_snapshot`** *(string)*: Item title at time of purchase.
* **`sku_snapshot`** *(string)*: SKU at purchase.
* **`quantity`** *(number)*: Quantity purchased.
* **`unit_price`** *(number)*: Price per unit.
* **`total`** *(number)*: Line item total.

#### 8. `/pos_ledger/{storeId}/{orderId}`
Real-time cashier shift ledger and terminal telemetry.
* **`id`** *(string)*: Order reference.
* **`terminal_id`** *(string)*: Originating register ID.
* **`terminal_name`** *(string)*: Terminal display name.
* **`cashier_name`** *(string)*: Name of operating staff.
* **`amount`** *(number)*: Total transaction value.
* **`payment_method`** *(string)*: Method used.
* **`created_at`** *(string)*: Timestamp.

#### 9. `/subscriptions/{storeId}`
Billing status and plan information.
* **`id`** *(string)*: Subscription ID.
* **`store_id`** *(string)*: Tenant ID.
* **`plan_id`** *(string)*: `"starter" | "pro" | "enterprise"`.
* **`status`** *(string)*: `"Active" | "Past Due" | "Canceled"`.
* **`mrr`** *(number)*: Monthly recurring revenue amount.
* **`current_period_start`** *(string)*: Cycle start date.
* **`current_period_end`** *(string)*: Renewal date.

#### 10. `/users/{uid}`
User profiles for merchants, wholesalers, staff, and platform administrators.
* **`id`** *(string)*: Firebase Auth UID.
* **`name`** *(string)*: User full name.
* **`email`** *(string)*: User email.
* **`phone`** *(string, optional)*: Contact phone.
* **`role`** *(string)*: `"merchant" | "wholesaler" | "cashier" | "admin"` (write-once at sign-up).
* **`store_id`** *(string, optional)*: Assigned store.
* **`created_at`** *(string)*: Account creation timestamp.

#### 11. `/wholesalers/{wholesalerId}`
Directory profiles and volume product catalogs for registered wholesalers.
* **`profile`** *(object)*:
  * **`name`** *(string)*: Wholesaler business name.
  * **`nameAr`** *(string)*: Arabic business name.
  * **`categories`** *(object/array)*: Supported store categories (e.g. `{"clothing": true}`).
  * **`country`**, **`city`** *(string)*: Geographic location.
  * **`contact`** *(object)*: `{ email, phone, whatsapp }`.
  * **`minOrderValue`** *(number)*: Minimum order value (e.g. 2500 EGP).
  * **`currency`** *(string)*: Currency code (`EGP`).
  * **`status`** *(string)*: `"active" | "paused"`.
* **`products/{productId}`** *(object)*:
  * **`sku`**, **`name`**, **`nameAr`**, **`imageUrl`**, **`category`** *(string)*.
  * **`basePrice`**, **`msrp`**, **`moq`** *(number)*.
  * **`unit`** *(string)*: `"piece" | "pack" | "carton"`.
  * **`tiers`** *(array)*: `[{ minQty: 12, price: 170 }, { minQty: 50, price: 155 }]`.
  * **`stock`** *(number)*: Available quantity.
  * **`status`** *(string)*: `"active" | "paused"`.

#### 12. `/wholesalerInquiries/{inquiryId}`
Direct trade inquiries and quote requests sent from retail stores to wholesalers.
* **`storeId`** *(string)*: Inquiring retail store ID.
* **`wholesalerId`** *(string)*: Recipient wholesaler ID.
* **`productId`** *(string)*: Product ID requested.
* **`sku`** *(string)*: Product SKU.
* **`qty`** *(number)*: Requested order quantity.
* **`offeredPrice`** *(number)*: Tier or negotiated unit price.
* **`note`** *(string, optional)*: Note or customization request.
* **`status`** *(string)*: `"new" | "quoted" | "accepted" | "declined"`.
* **`createdAt`** *(string)*: ISO timestamp.

---

## 5. Instant 1-Click Database Seeding (Recommended)

A ready-to-import database dump has been generated for you in the repository root: **`firebase-rtdb-seed.json`**. It contains pre-configured stores (`peacock_store` with category `clothing`, `urban_kicks` with category `clothing`, `living_store` with category `home-appliances`), verified wholesalers (`wholesaler_clothing_01`, `wholesaler_home_01`), products, categories, branches, and cashier terminals.

### How to Import with 1 Click:
1. Open [Firebase Console](https://console.firebase.google.com/) &rarr; select **`matager-egv01`**.
2. Go to **Build** &rarr; **Realtime Database** &rarr; **Data** tab.
3. Click the **three vertical dots (`⋮`)** in the upper-right corner of the data pane.
4. Select **Import JSON**.
5. Browse and select the file:
   ```
   firebase-rtdb-seed.json
   ```
6. Click **Import**.

Your Realtime Database will immediately populate with all required nodes and initial demo data.

---

## 6. Running the Application

### 1. Verify Local Environment
Ensure `.env.local` has the updated Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD_yJ3inVvSzwSPAQPtpXJSYgxH5J2gajo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=matager-egv01.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://matager-egv01-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=matager-egv01
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=matager-egv01.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=789251938163
NEXT_PUBLIC_FIREBASE_APP_ID=1:789251938163:web:9bff4eff91f73abfb61706
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-77YTXR85KB
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Application Entry Points
* **Landing Page:** [http://localhost:3000/](http://localhost:3000/)
* **Online Storefront:** [http://localhost:3000/storefront?storeId=peacock_store](http://localhost:3000/storefront?storeId=peacock_store)
* **Merchant Dashboard:** [http://localhost:3000/dashboard?storeId=peacock_store](http://localhost:3000/dashboard?storeId=peacock_store)
* **Wholesaler Console:** [http://localhost:3000/wholesaler?wholesalerId=wholesaler_clothing_01](http://localhost:3000/wholesaler?wholesalerId=wholesaler_clothing_01)
* **Cashier POS Terminal:** [http://localhost:3000/cashier?storeId=peacock_store](http://localhost:3000/cashier?storeId=peacock_store)
* **Platform Super Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)

