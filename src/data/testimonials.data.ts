/**
 * TODO: PLACEHOLDER COPY NOTICE
 * The quotes, reviewer names, and company labels below are realistic placeholder
 * testimonials for the staging launch and MUST be replaced with verified customer
 * quotes before final public production release.
 */

export type UserRoleType = "store_owner" | "customer" | "wholesaler";

export interface TestimonialItem {
  id: string;
  role: UserRoleType;
  nameEn: string;
  nameAr: string;
  initials: string;
  roleLabelEn: string;
  roleLabelAr: string;
  companyCityEn: string;
  companyCityAr: string;
  quoteEn: string;
  quoteAr: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  // ─── 1. STORE OWNERS (3 items) ───
  {
    id: "review-owner-1",
    role: "store_owner",
    nameEn: "Tarek Mansour",
    nameAr: "طارق منصور",
    initials: "TM",
    roleLabelEn: "Store Owner",
    roleLabelAr: "صاحب متجر",
    companyCityEn: "Al-Mansour Fashion · Cairo",
    companyCityAr: "أزياء المنصور · القاهرة",
    quoteEn:
      "Matager unified our 3 retail branches and our online storefront into one real-time inventory ledger. We eliminated overselling entirely.",
    quoteAr:
      "وحّدت منصة متاجر فروعنا الثلاثة مع متجرنا الإلكتروني في سجل مخزون فوري واحد. تخلصنا تماماً من مشكلة تضارب وتكرار بيع المنتجات.",
  },
  {
    id: "review-owner-2",
    role: "store_owner",
    nameEn: "Hany Abdelrahman",
    nameAr: "هاني عبدالرحمن",
    initials: "HA",
    roleLabelEn: "Store Owner",
    roleLabelAr: "صاحب متجر",
    companyCityEn: "Apex Tech Gears · Alexandria",
    companyCityAr: "أبيكس تك · الإسكندرية",
    quoteEn:
      "The hardware POS integration works flawlessly even when our store WiFi fluctuates. It syncs the second connection restores.",
    quoteAr:
      "نظام الكاشير POS يعمل بثبات مذهل حتى مع تذبذب شبكة الواي فاي بالمتجر. يقوم بالمزامنة الفورية بمجرد عودة الاتصال دون أي تعطل.",
  },
  {
    id: "review-owner-3",
    role: "store_owner",
    nameEn: "Nourhan El-Shamy",
    nameAr: "نورهان الشامي",
    initials: "NE",
    roleLabelEn: "Store Owner",
    roleLabelAr: "صاحبة متجر",
    companyCityEn: "Lumina Home Goods · Giza",
    companyCityAr: "لومينا للأدوات المنزلية · الجيزة",
    quoteEn:
      "Setting up 200 products took less than an hour. The instant multi-payment checkout helped us increase completed orders by 35%.",
    quoteAr:
      "إدخال وتجهيز 200 منتج لم يستغرق منا أكثر من ساعة. الدفع المتعدد الفوري ساعدنا على رفع نسبة إتمام الطلبات بنسبة 35%.",
  },

  // ─── 2. CUSTOMERS (3 items) ───
  {
    id: "review-customer-1",
    role: "customer",
    nameEn: "Ahmed Zaki",
    nameAr: "أحمد زكي",
    initials: "AZ",
    roleLabelEn: "Customer",
    roleLabelAr: "عميل مشتري",
    companyCityEn: "Shopper · Maadi, Cairo",
    companyCityAr: "مشتري · المعادي، القاهرة",
    quoteEn:
      "The storefront loads instantly on mobile and checkout via Apple Pay took literally 4 seconds. Smoothest local e-commerce experience.",
    quoteAr:
      "المتجر يفتح بسرعة فائقة على الهاتف، وعملية الدفع عبر آبل باي استغرقت حرفياً 4 ثوانٍ. أسلس تجربة تسوق إلكتروني خضتها محلياً.",
  },
  {
    id: "review-customer-2",
    role: "customer",
    nameEn: "Salma Fouad",
    nameAr: "سلمى فؤاد",
    initials: "SF",
    roleLabelEn: "Customer",
    roleLabelAr: "عميلة مشترية",
    companyCityEn: "Shopper · Sheikh Zayed",
    companyCityAr: "مشترية · الشيخ زايد",
    quoteEn:
      "Real-time order tracking and WhatsApp notifications gave me peace of mind. Delivery arrived right on the estimated time slot.",
    quoteAr:
      "تتبع الشحنة الحي والتنبيهات المباشرة عبر الواتساب كانت ممتازة ومريحة. الطلب وصل تماماً في الموعد المحدد دون أي تأخير.",
  },
  {
    id: "review-customer-3",
    role: "customer",
    nameEn: "Karim Mostafa",
    nameAr: "كريم مصطفى",
    initials: "KM",
    roleLabelEn: "Customer",
    roleLabelAr: "عميل مشتري",
    companyCityEn: "Shopper · Heliopolis",
    companyCityAr: "مشتري · مصر الجديدة",
    quoteEn:
      "Digital tax invoice with QR arrived immediately to my email. Returning an item at the physical branch was seamless with the ticket code.",
    quoteAr:
      "الفاتورة الضريبية برمز الـ QR وصلت لبريدي فوراً. واستبدال صنف داخل الفرع الفعلي تم خلال دقيقة واحدة عبر رمز التذكرة.",
  },

  // ─── 3. WHOLESALERS & MANUFACTURERS (3 items) ───
  {
    id: "review-wholesaler-1",
    role: "wholesaler",
    nameEn: "Mahmoud Soliman",
    nameAr: "محمود سليمان",
    initials: "MS",
    roleLabelEn: "Wholesaler",
    roleLabelAr: "مورد جملة",
    companyCityEn: "Delta FMCG Distribution · Tanta",
    companyCityAr: "الدلتا للتوزيع الغذائي · طنطا",
    quoteEn:
      "We supply over 40 merchants through Matager's wholesale network. Automatic tiered quantity discounts save our sales reps dozens of hours.",
    quoteAr:
      "نقوم بتوريد منتجاتنا لأكثر من 40 متجراً عبر شبكة الجملة في متاجر. الخصومات المتدرجة للكميات وفرت على فريق المبيعات عشرات الساعات.",
  },
  {
    id: "review-wholesaler-2",
    role: "wholesaler",
    nameEn: "Khaled El-Banna",
    nameAr: "خالد البنا",
    initials: "KB",
    roleLabelEn: "Wholesaler",
    roleLabelAr: "مورد جملة",
    companyCityEn: "Egyptian Textile Mills · Mahalla",
    companyCityAr: "مطاحن ومصانع الغزل · المحلة",
    quoteEn:
      "Direct verified merchant requests keep out tire-kickers. Every inquiry we receive on Matager converts into an actual commercial pallet order.",
    quoteAr:
      "الطلبات المباشرة من التجار المعتمدين تحفظ وقتنا. كل استفسار نتلقاه عبر متاجر يتحول إلى طلبية توريد تجارية فعلية بالمستودعات.",
  },
  {
    id: "review-wholesaler-3",
    role: "wholesaler",
    nameEn: "Youssef Qassem",
    nameAr: "يوسف قاسم",
    initials: "YQ",
    roleLabelEn: "Wholesaler",
    roleLabelAr: "مورد جملة",
    companyCityEn: "Apex Packaging Industrial · 6th of October",
    companyCityAr: "أبيكس لحلول التعبئة · 6 أكتوبر",
    quoteEn:
      "Settlement telemetry is transparent and on-time. Managing wholesale pricing for verified retailers has never been this straightforward.",
    quoteAr:
      "التسويات المالية واضحة ومنضبطة في مواعيدها. إدارة تسعير الجملة للتجار الموثقين أصبحت غاية في السلاسة والاحترافية.",
  },
];

