/**
 * Matager Multi-Tenant Database Schema Types
 *
 * Implements the canonical Super Admin & Platform Database Structure (v2)
 * for Cloud Firestore and backend services.
 */

// --- Users & Admins ---

export interface AdminUser {
  id: string; // uuid / uid
  name: string;
  email: string;
  role: "Super Admin" | "Support" | "Finance" | string;
  created_at: string;
}

export interface User {
  id: string; // uuid / uid
  name: string;
  email: string;
  phone?: string;
  role: "Merchant" | "Store Owner" | "Cashier" | "Manager" | string;
  store_id?: string;
  created_at: string;
}

// --- Core Multi-Tenant Entities ---

export interface Store {
  id: string; // uuid / store_uid
  owner_id: string; // ref: User.id
  client_id?: string;
  name: string; // e.g. Peacock Store
  legal_name?: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  subdomain: string; // e.g. peacock.matager.com
  status: "Active" | "Trial" | "Past Due" | "Suspended";
  kyc_status: "Approved" | "Pending" | "Rejected";
  gmv_30d: number; // Cached metric for dashboard
  orders_30d: number; // Cached metric for dashboard
  category?: string;
  sales_channel?: "hybrid" | "online" | "pos";
  expected_volume?: string;
  tier_price?: number;
  currency?: string;
  plan?: "starter" | "pro" | "enterprise";
  pos_count?: number;
  branches?: Record<string, Branch>;
  location?: {
    country: string;
    city: string;
    address: string;
  };
  contact?: {
    email: string;
    phone: string;
  };
  created_at: string;
  updated_at?: string;
}

// --- Subscriptions & Billing ---

export interface SubscriptionPlan {
  id: string;
  name: string; // e.g. Matager-50, Matager-100, Pro
  price: number;
  commission_rate: number; // Platform commission % (e.g. 5.0)
  created_at: string;
}

export interface Subscription {
  id: string;
  store_id: string;
  plan_id: string;
  status: "Active" | "Past Due" | "Canceled";
  mrr: number;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

// --- POS & Retail Operations ---

export interface Branch {
  id: string;
  store_id: string;
  name: string; // e.g. Heliopolis Branch, Flagship
  address: string;
  city?: string;
  country?: string;
  phone: string;
  status: "Active" | "Inactive";
  is_default?: boolean;
  pos_count?: number;
  pos_systems?: Record<string, PosTerminal>;
  created_at: string;
}

export interface Employee {
  id: string;
  store_id: string;
  branch_id?: string | null;
  name: string;
  email?: string | null;
  pin_code: string; // 4-6 digit code for quick POS login
  role: "Cashier" | "Manager" | "Stock Keeper" | string;
  status: "Active" | "Suspended" | "Terminated";
  created_at: string;
}

export interface PosTerminal {
  id: string;
  store_id: string;
  branch_id: string;
  name: string; // e.g. Register 1, Portable POS
  device_serial?: string | null;
  status: "Active" | "Offline";
  created_at: string;
}

export interface Shift {
  id: string;
  store_id: string;
  branch_id: string;
  employee_id: string;
  terminal_id: string;
  status: "Open" | "Closed";
  opening_float: number;
  closing_float?: number | null;
  expected_cash?: number | null;
  variance?: number | null;
  opened_at: string;
  closed_at?: string | null;
}

// --- Financials & Payouts ---

export interface Transaction {
  id: string;
  store_id: string;
  branch_id?: string | null;
  employee_id?: string | null;
  shift_id?: string | null;
  amount: number;
  commission_earned: number;
  gateway_fee: number;
  status: "Completed" | "Pending" | "Failed" | "Cancelled";
  type: "Order" | "Subscription" | "Refund";
  channel: "POS" | "Online";
  payment_method: "Cash" | "Card" | "Wallet" | "ApplePay" | "Mada" | string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  items_count?: number;
  shipping_address?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  store_id: string;
  product_id: string;
  variant_id: string;
  name_snapshot: string;
  sku_snapshot: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export interface Payout {
  id: string;
  store_id: string;
  amount: number;
  status: "Pending" | "Failed" | "Paid";
  failure_reason?: string | null;
  scheduled_date: string;
  created_at: string;
}

// --- Support, Feature Flags & Audit ---

export interface SupportTicket {
  id: string;
  store_id: string;
  subject: string;
  priority: "Urgent" | "High" | "Normal";
  status: "Open" | "Escalated" | "Resolved";
  sla_risk: boolean;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  scope: "Global" | "Store";
  rollout_percentage: number;
  is_enabled: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_store_id?: string | null;
  details: string;
  created_at: string;
}

// --- Product Catalog (SPU → Option → Variant → Stock) ---

export interface Category {
  id: string;
  store_id?: string | null; // null = global catalog template
  parent_id?: string | null;
  name: string;
  slug: string;
  path: string;
  level: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductTypeAttribute {
  id: string;
  product_type: string;
  category_id?: string | null;
  key: string;
  label: string;
  data_type: "string" | "number" | "boolean" | "enum" | "array";
  unit?: string | null;
  enum_values?: string[] | null;
  is_required: boolean;
  is_variant_level: boolean;
  position: number;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string | null;
  product_type: string;
  name: string;
  slug: string;
  product_url?: string;
  description: string;
  short_description?: string;
  brand: string;
  base_price: number;
  sale_amount?: number;
  site_price: number;
  tax_rate: number;
  currency: string;
  attributes: Record<string, any>;
  has_variants: boolean;
  is_active: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: string;
  product_id: string;
  store_id: string;
  name: string; // Size, Color, Ring Size, Capacity
  code: string; // size, color, ring_size
  position: number;
  created_at: string;
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  product_id: string;
  store_id: string;
  value: string; // M, XL, Red, Blue, 18K
  code: string; // m, xl, red
  hex_color?: string | null;
  position: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  store_id: string;
  sku: string;
  barcode?: string | null;
  variant_name: string; // "Red / M"
  price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  tax_rate?: number | null;
  weight_grams?: number | null;
  dimensions?: { l: number; w: number; h: number; unit: string } | null;
  attributes?: Record<string, any> | null;
  primary_image_id?: string | null;
  stock_total: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantOption {
  id: string;
  variant_id: string;
  option_id: string;
  option_value_id: string;
  product_id: string;
  store_id: string;
}

export interface ProductImage {
  id: string;
  store_id: string;
  product_id: string;
  variant_id?: string | null;
  option_value_id?: string | null;
  url: string;
  alt_text?: string;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariantStock {
  id: string;
  store_id: string;
  variant_id: string;
  branch_id: string;
  quantity: number;
  reserved: number;
  low_stock_threshold: number;
  updated_at: string;
}

// --- Promo Codes & Discounts ---

export interface PromoCode {
  id: string;
  store_id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: "Percentage" | "Fixed Amount" | "Free Shipping";
  discount_value: number;
  max_discount_amount?: number | null;
  min_order_amount?: number;
  applies_to: "Order" | "Product" | "Category" | "Shipping";
  status: "Draft" | "Active" | "Paused" | "Expired" | "Disabled";
  starts_at?: string;
  ends_at?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  used_count: number;
  is_stackable: boolean;
  created_by_admin_id?: string | null;
  created_by_user_id?: string | null;
  created_at: string;
}

export interface PromoCodeProduct {
  id: string;
  promo_code_id: string;
  product_id: string;
  variant_id?: string | null;
  store_id: string;
  created_at: string;
}

export interface PromoCodeRedemption {
  id: string;
  promo_code_id: string;
  store_id: string;
  user_id?: string | null;
  transaction_id?: string | null;
  discount_amount: number;
  status: "Reserved" | "Applied" | "Canceled";
  redeemed_at: string;
  created_at: string;
}
