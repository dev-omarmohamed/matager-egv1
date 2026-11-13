import arabCountriesRaw from "@/data/arab-countries.json";

export interface ArabCountry {
  id: string; // ISO2 e.g. "EG"
  name: string; // English name e.g. "Egypt"
  nameAr: string; // Arabic name e.g. "جمهورية مصر العربية"
  currency: string; // Currency code e.g. "EGP"
  currencyAr: string; // Arabic symbol e.g. "ج.م"
  currencyNameEn: string; // "Egyptian pound"
  currencyNameAr: string; // "الجنيه المصري"
  dialCode: string; // e.g. "+20"
}

export interface ArabCity {
  id: number | string;
  name_en: string;
  name_ar: string | null;
  lat: number;
  lng: number;
  region_en?: string;
  region_ar?: string;
}

export const ARAB_COUNTRIES: ArabCountry[] = [
  {
    id: "EG",
    name: "Egypt",
    nameAr: "جمهورية مصر العربية",
    currency: "EGP",
    currencyAr: "ج.م",
    currencyNameEn: "Egyptian pound",
    currencyNameAr: "الجنيه المصري",
    dialCode: "+20",
  },
  {
    id: "SA",
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    currency: "SAR",
    currencyAr: "ر.س",
    currencyNameEn: "Saudi riyal",
    currencyNameAr: "الريال السعودي",
    dialCode: "+966",
  },
  {
    id: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    currency: "AED",
    currencyAr: "د.إ",
    currencyNameEn: "UAE dirham",
    currencyNameAr: "الدرهم الإماراتي",
    dialCode: "+971",
  },
  {
    id: "KW",
    name: "Kuwait",
    nameAr: "الكويت",
    currency: "KWD",
    currencyAr: "د.ك",
    currencyNameEn: "Kuwaiti dinar",
    currencyNameAr: "الدينار الكويتي",
    dialCode: "+965",
  },
  {
    id: "QA",
    name: "Qatar",
    nameAr: "قطر",
    currency: "QAR",
    currencyAr: "ر.ق",
    currencyNameEn: "Qatari riyal",
    currencyNameAr: "الريال القطري",
    dialCode: "+974",
  },
  {
    id: "BH",
    name: "Bahrain",
    nameAr: "البحرين",
    currency: "BHD",
    currencyAr: "د.ب",
    currencyNameEn: "Bahraini dinar",
    currencyNameAr: "الدينار البحريني",
    dialCode: "+973",
  },
  {
    id: "OM",
    name: "Oman",
    nameAr: "سلطنة عمان",
    currency: "OMR",
    currencyAr: "ر.ع",
    currencyNameEn: "Omani rial",
    currencyNameAr: "الريال العماني",
    dialCode: "+968",
  },
  {
    id: "JO",
    name: "Jordan",
    nameAr: "الأردن",
    currency: "JOD",
    currencyAr: "د.أ",
    currencyNameEn: "Jordanian dinar",
    currencyNameAr: "الدينار الأردني",
    dialCode: "+962",
  },
  {
    id: "IQ",
    name: "Iraq",
    nameAr: "العراق",
    currency: "IQD",
    currencyAr: "د.ع",
    currencyNameEn: "Iraqi dinar",
    currencyNameAr: "الدينار العراقي",
    dialCode: "+964",
  },
  {
    id: "MA",
    name: "Morocco",
    nameAr: "المغرب",
    currency: "MAD",
    currencyAr: "د.م.",
    currencyNameEn: "Moroccan dirham",
    currencyNameAr: "الدرهم المغربي",
    dialCode: "+212",
  },
  {
    id: "DZ",
    name: "Algeria",
    nameAr: "الجزائر",
    currency: "DZD",
    currencyAr: "د.ج",
    currencyNameEn: "Algerian dinar",
    currencyNameAr: "الدينار الجزائري",
    dialCode: "+213",
  },
  {
    id: "TN",
    name: "Tunisia",
    nameAr: "تونس",
    currency: "TND",
    currencyAr: "د.ت",
    currencyNameEn: "Tunisian dinar",
    currencyNameAr: "الدينار التونسي",
    dialCode: "+216",
  },
  {
    id: "LB",
    name: "Lebanon",
    nameAr: "لبنان",
    currency: "LBP",
    currencyAr: "ل.ل",
    currencyNameEn: "Lebanese pound",
    currencyNameAr: "الليرة اللبنانية",
    dialCode: "+961",
  },
  {
    id: "LY",
    name: "Libya",
    nameAr: "ليبيا",
    currency: "LYD",
    currencyAr: "د.ل",
    currencyNameEn: "Libyan dinar",
    currencyNameAr: "الدينار الليبي",
    dialCode: "+218",
  },
  {
    id: "PS",
    name: "Palestine",
    nameAr: "فلسطين",
    currency: "ILS",
    currencyAr: "₪",
    currencyNameEn: "Shekel / Dinar",
    currencyNameAr: "الشيكل / الدينار",
    dialCode: "+970",
  },
  {
    id: "SD",
    name: "Sudan",
    nameAr: "السودان",
    currency: "SDG",
    currencyAr: "ج.س",
    currencyNameEn: "Sudanese pound",
    currencyNameAr: "الجنيه السوداني",
    dialCode: "+249",
  },
  {
    id: "SY",
    name: "Syria",
    nameAr: "سوريا",
    currency: "SYP",
    currencyAr: "ل.س",
    currencyNameEn: "Syrian pound",
    currencyNameAr: "الليرة السورية",
    dialCode: "+963",
  },
  {
    id: "YE",
    name: "Yemen",
    nameAr: "اليمن",
    currency: "YER",
    currencyAr: "ر.ي",
    currencyNameEn: "Yemeni rial",
    currencyNameAr: "الريال اليمني",
    dialCode: "+967",
  },
  {
    id: "SO",
    name: "Somalia",
    nameAr: "الصومال",
    currency: "SOS",
    currencyAr: "ش.ص",
    currencyNameEn: "Somali shilling",
    currencyNameAr: "الشلن الصومالي",
    dialCode: "+252",
  },
  {
    id: "MR",
    name: "Mauritania",
    nameAr: "موريتانيا",
    currency: "MRU",
    currencyAr: "أ.م",
    currencyNameEn: "Mauritanian ouguiya",
    currencyNameAr: "الأوقية الموريتانية",
    dialCode: "+222",
  },
  {
    id: "DJ",
    name: "Djibouti",
    nameAr: "جيبوتي",
    currency: "DJF",
    currencyAr: "ف.ج",
    currencyNameEn: "Djiboutian franc",
    currencyNameAr: "الفرنك الجيبوتي",
    dialCode: "+253",
  },
  {
    id: "KM",
    name: "Comoros",
    nameAr: "جزر القمر",
    currency: "KMF",
    currencyAr: "ف.ق",
    currencyNameEn: "Comorian franc",
    currencyNameAr: "الفرنك القمري",
    dialCode: "+269",
  },
];

const PRIORITY_CITIES: Record<string, string[]> = {
  EG: [
    "Cairo",
    "Alexandria",
    "Giza",
    "Mansoura",
    "Tanta",
    "Port Said",
    "Suez",
    "Luxor",
    "Aswan",
    "Zagazig",
    "Ismailia",
    "Hurghada",
    "Sharm el-Sheikh",
  ],
  SA: [
    "Riyadh",
    "Jeddah",
    "Mecca",
    "Medina",
    "Dammam",
    "Khobar",
    "Tabuk",
    "Buraydah",
    "Taif",
    "Abha",
    "Hail",
    "Jazan",
    "Najran",
  ],
  AE: [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
    "Al Ain",
  ],
  KW: ["Kuwait City", "Hawally", "Salmiya", "Al Farwaniyah", "Al Ahmadi"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Lusail", "Umm Salal"],
  BH: ["Manama", "Riffa", "Muharraq", "Hamad Town", "A'ali"],
  OM: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Seeb"],
  JO: ["Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba"],
  IQ: ["Baghdad", "Basra", "Erbil", "Mosul", "Sulaymaniyah", "Najaf", "Karbala"],
  MA: ["Casablanca", "Rabat", "Marrakech", "Tangier", "Fes", "Agadir", "Meknes"],
  DZ: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Setif"],
  TN: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabes"],
  LB: ["Beirut", "Tripoli", "Sidon", "Tyre", "Byblos", "Jounieh"],
  LY: ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya"],
  PS: ["Jerusalem", "Ramallah", "Gaza", "Nablus", "Hebron", "Bethlehem", "Jenin"],
  SD: ["Khartoum", "Omdurman", "Port Sudan", "Kassala"],
  SY: ["Damascus", "Aleppo", "Homs", "Latakia", "Hama"],
  YE: ["Sana'a", "Aden", "Taiz", "Al Hudaydah", "Mukalla"],
  SO: ["Mogadishu", "Hargeisa", "Bosaso"],
  MR: ["Nouakchott", "Nouadhibou"],
  DJ: ["Djibouti"],
  KM: ["Moroni"],
};

const CITY_AR_OVERRIDES: Record<string, string> = {
  Marrakech: "مراكش",
  "Sharm el-Sheikh": "شرم الشيخ",
  "Port Said": "بورسعيد",
  Ismailia: "الإسماعيلية",
  Zagazig: "الزقازيق",
  Luxor: "الأقصر",
  Aswan: "أسوان",
  Hurghada: "الغردقة",
  Mansoura: "المنصورة",
  Tanta: "طنطا",
  Dammam: "الدمام",
  Khobar: "الخبر",
  Dhahran: "الظهران",
  Buraydah: "بريدة",
  Taif: "الطائف",
  Abha: "أبها",
  Salmiya: "السالمية",
  Hawally: "حولي",
  Lusail: "لوسيل",
  "Al Rayyan": "الريان",
  "Al Wakrah": "الوكرة",
  "Al Khor": "الخور",
  Muharraq: "المحرق",
  Riffa: "الرفاع",
  Salalah: "صلالة",
  Sohar: "صحار",
  Aqaba: "العقبة",
  Irbid: "إربد",
  Zarqa: "الزرقاء",
  Erbil: "أربيل",
  Basra: "البصرة",
  Mosul: "الموصل",
  Sulaymaniyah: "السليمانية",
  Najaf: "النجف",
  Karbala: "كربلاء",
  Casablanca: "الدار البيضاء",
  Rabat: "الرباط",
  Tangier: "طنجة",
  Fes: "فاس",
  Agadir: "أكادير",
  Algiers: "الجزائر العاصمة",
  Oran: "وهران",
  Constantine: "قسنطينة",
  Tunis: "تونس العاصمة",
  Sfax: "صفاقس",
  Sousse: "سوسة",
  Ramallah: "رام الله",
  Gaza: "غزة",
  Nablus: "نابلس",
  Hebron: "الخليل",
  Bethlehem: "بيت لحم",
  Jerusalem: "القدس الشريف",
  Khartoum: "الخرطوم",
  Omdurman: "أم درمان",
  "Port Sudan": "بورتسودان",
  Aleppo: "حلب",
  Homs: "حمص",
  Latakia: "اللاذقية",
  Aden: "عدن",
  "Sana'a": "صنعاء",
  Mogadishu: "مقديشو",
  Nouakchott: "نواكشوط",
  Moroni: "موروني",
};

/**
 * Find country metadata by ISO2 code, English name, or Arabic name.
 */
export function getCountry(query: string): ArabCountry | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return ARAB_COUNTRIES.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      c.nameAr.toLowerCase() === q ||
      (c.nameAr.includes("مصر") && q.includes("مصر")) ||
      (c.nameAr.includes("السعودية") && q.includes("السعودية")) ||
      (c.nameAr.includes("الإمارات") && q.includes("الإمارات"))
  );
}

/**
 * Get all deduplicated and prioritized cities for an Arab country.
 */
export function getCitiesForCountry(countryQuery: string): ArabCity[] {
  const countryMeta = getCountry(countryQuery);
  const iso2 = countryMeta ? countryMeta.id : countryQuery.toUpperCase();

  const rawCountry = (arabCountriesRaw as any[]).find(
    (c) =>
      c.iso2?.toUpperCase() === iso2 ||
      c.name_en?.toLowerCase() === countryQuery.trim().toLowerCase() ||
      c.name_ar?.toLowerCase() === countryQuery.trim().toLowerCase()
  );

  if (!rawCountry || !Array.isArray(rawCountry.regions)) {
    return [];
  }

  const seenNames = new Set<string>();
  const cities: ArabCity[] = [];

  for (const region of rawCountry.regions) {
    if (!Array.isArray(region.cities)) continue;
    for (const rawCity of region.cities) {
      const nameEn = (rawCity.name_en || "").trim();
      if (!nameEn || seenNames.has(nameEn.toLowerCase())) {
        continue;
      }
      seenNames.add(nameEn.toLowerCase());

      const lat = parseFloat(rawCity.lat || "0") || 0;
      const lng = parseFloat(rawCity.lng || "0") || 0;

      const nameAr =
        rawCity.name_ar?.trim() ||
        CITY_AR_OVERRIDES[nameEn] ||
        null;

      cities.push({
        id: rawCity.id || `${iso2}_${nameEn}`,
        name_en: nameEn,
        name_ar: nameAr,
        lat,
        lng,
        region_en: region.name_en,
        region_ar: region.name_ar,
      });
    }
  }

  // Sort: Priority cities first, followed by alphabetical by name_en
  const priorityList = (PRIORITY_CITIES[iso2] || []).map((s) => s.toLowerCase());

  cities.sort((a, b) => {
    const aIdx = priorityList.indexOf(a.name_en.toLowerCase());
    const bIdx = priorityList.indexOf(b.name_en.toLowerCase());

    if (aIdx !== -1 && bIdx !== -1) {
      return aIdx - bIdx;
    }
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;

    return a.name_en.localeCompare(b.name_en);
  });

  return cities;
}

/**
 * Get coordinates for a specific country and city.
 */
export function getCityCoordinates(
  countryQuery: string,
  cityName: string
): { lat: number; lng: number } | null {
  const cities = getCitiesForCountry(countryQuery);
  if (!cities.length || !cityName) return null;

  const target = cityName.trim().toLowerCase();
  const match = cities.find(
    (c) =>
      c.name_en.toLowerCase() === target ||
      (c.name_ar && c.name_ar.toLowerCase() === target)
  );

  if (match && (match.lat !== 0 || match.lng !== 0)) {
    return { lat: match.lat, lng: match.lng };
  }

  // Fallback to first city if target not matched
  if (cities[0] && (cities[0].lat !== 0 || cities[0].lng !== 0)) {
    return { lat: cities[0].lat, lng: cities[0].lng };
  }

  return null;
}

/**
 * Generate a Google Maps URL from latitude and longitude.
 */
export function generateGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

