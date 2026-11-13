import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ARAB_COUNTRIES,
  getCountry,
  getCitiesForCountry,
  getCityCoordinates,
  generateGoogleMapsUrl,
} from "../arab-countries";

test("ARAB_COUNTRIES contains exactly 22 Arab countries with required metadata", () => {
  assert.equal(ARAB_COUNTRIES.length, 22);

  const iso2Codes = ARAB_COUNTRIES.map((c) => c.id);
  assert.ok(iso2Codes.includes("EG"));
  assert.ok(iso2Codes.includes("SA"));
  assert.ok(iso2Codes.includes("AE"));
  assert.ok(iso2Codes.includes("KW"));
  assert.ok(iso2Codes.includes("QA"));
  assert.ok(iso2Codes.includes("BH"));
  assert.ok(iso2Codes.includes("OM"));
  assert.ok(iso2Codes.includes("JO"));
  assert.ok(iso2Codes.includes("IQ"));
  assert.ok(iso2Codes.includes("MA"));
  assert.ok(iso2Codes.includes("DZ"));
  assert.ok(iso2Codes.includes("TN"));
  assert.ok(iso2Codes.includes("LB"));
  assert.ok(iso2Codes.includes("LY"));
  assert.ok(iso2Codes.includes("PS"));
  assert.ok(iso2Codes.includes("SD"));
  assert.ok(iso2Codes.includes("SY"));
  assert.ok(iso2Codes.includes("YE"));
  assert.ok(iso2Codes.includes("SO"));
  assert.ok(iso2Codes.includes("MR"));
  assert.ok(iso2Codes.includes("DJ"));
  assert.ok(iso2Codes.includes("KM"));

  for (const c of ARAB_COUNTRIES) {
    assert.ok(c.name.length > 0, `Country ${c.id} missing name`);
    assert.ok(c.nameAr.length > 0, `Country ${c.id} missing nameAr`);
    assert.ok(c.currency.length > 0, `Country ${c.id} missing currency`);
    assert.ok(c.currencyAr.length > 0, `Country ${c.id} missing currencyAr`);
    assert.ok(c.dialCode.startsWith("+"), `Country ${c.id} dialCode invalid: ${c.dialCode}`);
  }
});

test("getCountry correctly resolves by code or English / Arabic name", () => {
  const byCode = getCountry("EG");
  assert.equal(byCode?.name, "Egypt");

  const byNameEn = getCountry("Saudi Arabia");
  assert.equal(byNameEn?.id, "SA");

  const byNameAr = getCountry("الإمارات العربية المتحدة");
  assert.equal(byNameAr?.id, "AE");
});

test("getCitiesForCountry returns deduplicated cities with priority order", () => {
  const egCities = getCitiesForCountry("Egypt");
  assert.ok(egCities.length > 50, "Egypt should have multiple cities");

  // Cairo, Alexandria, Giza should be at the top
  const topNames = egCities.slice(0, 3).map((c) => c.name_en);
  assert.deepEqual(topNames, ["Cairo", "Alexandria", "Giza"]);

  // Ensure no duplicate city names
  const names = egCities.map((c) => c.name_en.toLowerCase());
  const uniqueNames = new Set(names);
  assert.equal(names.length, uniqueNames.size, "Cities must be unique");

  // Check Arabic override
  const cairo = egCities.find((c) => c.name_en === "Cairo");
  assert.equal(cairo?.name_ar, "القاهرة");
});

test("getCityCoordinates and generateGoogleMapsUrl produce valid Google Maps coordinates", () => {
  const cairoCoords = getCityCoordinates("Egypt", "Cairo");
  assert.ok(cairoCoords, "Cairo coordinates must exist");
  assert.ok(Math.abs(cairoCoords.lat - 30.06) < 0.1, "Cairo latitude matches");
  assert.ok(Math.abs(cairoCoords.lng - 31.25) < 0.1, "Cairo longitude matches");

  const url = generateGoogleMapsUrl(cairoCoords.lat, cairoCoords.lng);
  assert.ok(url.startsWith("https://www.google.com/maps?q="));
  assert.ok(url.includes("30.06263"));
  assert.ok(url.includes("31.24967"));
});

