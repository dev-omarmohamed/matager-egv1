import { test } from "node:test";
import assert from "node:assert/strict";
import { STORE_CATEGORIES, CATEGORY_LABELS } from "../categories";
import { ARAB_COUNTRIES } from "../arab-countries";

test("categories - includes all requested new categories with en and ar labels", () => {
  const expectedNewCategories = ["vape-tobacco", "jewelry", "3d-works", "food-ordering"] as const;

  for (const cat of expectedNewCategories) {
    assert.ok(
      STORE_CATEGORIES.includes(cat as any),
      `Expected STORE_CATEGORIES to include ${cat}`
    );
    assert.ok(CATEGORY_LABELS[cat]?.en, `Missing English label for ${cat}`);
    assert.ok(CATEGORY_LABELS[cat]?.ar, `Missing Arabic label for ${cat}`);
  }

  assert.equal(CATEGORY_LABELS["vape-tobacco"].en, "Vape, E-Liquid & Tobacco");
  assert.equal(CATEGORY_LABELS["jewelry"].en, "Jewelry & Accessories");
  assert.equal(CATEGORY_LABELS["3d-works"].en, "3D Works (Files or Products)");
  assert.equal(CATEGORY_LABELS["food-ordering"].en, "Food & Restaurant Ordering");
});

test("store slug generator produces clean www.storename.com format", () => {
  const formatStoreSlug = (name: string): string => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return "storename";
    const slug = trimmed
      .replace(/[^\w\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "storename";
  };

  assert.equal(formatStoreSlug(""), "storename");
  assert.equal(formatStoreSlug("My Store"), "my-store");
  assert.equal(formatStoreSlug("Apex Luxury Store 2026!"), "apex-luxury-store-2026");
  assert.equal(formatStoreSlug("متجر الأناقة الحديث"), "متجر-الأناقة-الحديث");
});

test("password generator formula - m + half email + half phone + symbol + matager", () => {
  const generateStrongPassword = (email: string, phone: string) => {
    const emailUser = (email.split("@")[0] || "owner").replace(/[^a-zA-Z0-9]/g, "");
    const halfEmailLen = Math.max(2, Math.ceil(emailUser.length / 2));
    const emailPart = (emailUser.slice(0, halfEmailLen) || "adm").toLowerCase();

    const cleanPhoneDigits = phone.replace(/\D/g, "");
    const phonePart = cleanPhoneDigits.length >= 5 ? cleanPhoneDigits.slice(-5) : (cleanPhoneDigits || "12345");

    const symbol = "@";
    return `m${emailPart}${phonePart}${symbol}matager`;
  };

  const pass1 = generateStrongPassword("ahmed@store.com", "01012345678");
  assert.equal(pass1, "mahm45678@matager");
  assert.ok(pass1.length > 10, "Generated password must exceed 10 characters");

  const pass2 = generateStrongPassword("o@store.com", "01199999999");
  assert.ok(pass2.length > 10, "Generated password must exceed 10 characters");
  assert.ok(pass2.startsWith("m"));
  assert.ok(pass2.endsWith("@matager"));
});

test("validation - Egyptian phone strictly 11 digits and password strictly > 10 chars", () => {
  const isValidPhone = (p: string) => p.replace(/\D/g, "").length === 11;
  const isValidPassword = (p: string) => p.length > 10;

  // Phone checks
  assert.equal(isValidPhone("01012345678"), true);
  assert.equal(isValidPhone("010-1234-5678"), true);
  assert.equal(isValidPhone("0101234567"), false); // 10 digits
  assert.equal(isValidPhone("010123456789"), false); // 12 digits
  assert.equal(isValidPhone(""), false);

  // Password checks
  assert.equal(isValidPassword("1234567890"), false); // 10 chars exactly -> must exceed
  assert.equal(isValidPassword("12345678901"), true); // 11 chars
  assert.equal(isValidPassword("short"), false);
  assert.equal(isValidPassword("MatagerStore2026!"), true);
});

test("arab countries - Egypt is code +20 and present in dataset", () => {
  const egypt = ARAB_COUNTRIES.find((c) => c.name === "Egypt");
  assert.ok(egypt, "Egypt must be in ARAB_COUNTRIES");
  assert.equal(egypt.dialCode, "+20");
  assert.equal(egypt.currency, "EGP");
});
