const fs = require("fs");
const path = require("path");

// Read src/lib/i18n.ts content
const content = fs.readFileSync(path.join(__dirname, "../src/lib/i18n.ts"), "utf-8");

// Parse en and ar sections
const enStart = content.indexOf("  en: {");
const arStart = content.indexOf("  ar: {");
const end = content.indexOf("export type DashboardTranslations");

if (enStart === -1 || arStart === -1 || end === -1) {
  console.error("Could not find en/ar boundaries");
  process.exit(1);
}

// Evaluate using Function
const code = `
${content.substring(content.indexOf("export const dashboardTranslations = {"), end)}
return dashboardTranslations;
`.replace(/export const dashboardTranslations = /, "const dashboardTranslations = ");

const fn = new Function(code);
const dicts = fn();

function getPaths(obj, prefix = "") {
  let paths = [];
  for (const k of Object.keys(obj)) {
    const next = prefix ? prefix + "." + k : k;
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      paths.push(...getPaths(obj[k], next));
    } else {
      paths.push(next);
    }
  }
  return paths.sort();
}

const enPaths = getPaths(dicts.en);
const arPaths = getPaths(dicts.ar);

const missingInAr = enPaths.filter(p => !arPaths.includes(p));
const missingInEn = arPaths.filter(p => !enPaths.includes(p));

console.log("En paths count:", enPaths.length);
console.log("Ar paths count:", arPaths.length);

if (missingInAr.length > 0) {
  console.error("Keys missing in AR:", missingInAr);
}
if (missingInEn.length > 0) {
  console.error("Keys missing in EN:", missingInEn);
}

if (missingInAr.length === 0 && missingInEn.length === 0) {
  console.log("SUCCESS: 100% key-set parity between EN and AR!");
  process.exit(0);
} else {
  process.exit(1);
}

