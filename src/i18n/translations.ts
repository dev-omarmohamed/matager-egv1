export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brand: string;
    pillars: string;
    howItWorks: string;
    ecosystem: string;
    metrics: string;
    integrations: string;
    signIn: string;
    getStarted: string;
    customerStore: string;
    langToggle: string;
  };
  hero: {
    pillBadge: string;
    brand: string;
    tagline: string;
    supporting: string;
    primaryCta: string;
    secondaryCta: string;
    trustLine: string;
    terminalTab1: string;
    terminalTab2: string;
    terminalTab3: string;
    liveStatus: string;
    latency: string;
    throughput: string;
    activeVendors: string;
    chartTitle: string;
    chartSubtitle: string;
  };
  pillars: {
    sectionBadge: string;
    heading: string;
    subhead: string;
    card1Title: string;
    card1Description: string;
    card1Metric: string;
    card1MetricLabel: string;
    card2Title: string;
    card2Description: string;
    card2Metric: string;
    card2MetricLabel: string;
    card3Title: string;
    card3Description: string;
    card3Metric: string;
    card3MetricLabel: string;
    card4Title: string;
    card4Description: string;
    card4Metric: string;
    card4MetricLabel: string;
  };
  howItWorks: {
    sectionBadge: string;
    heading: string;
    subhead: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
  };
  ecosystem: {
    sectionBadge: string;
    heading: string;
    subhead: string;
    mod1Title: string;
    mod1Desc: string;
    mod2Title: string;
    mod2Desc: string;
    mod3Title: string;
    mod3Desc: string;
    mod4Title: string;
    mod4Desc: string;
    mod5Title: string;
    mod5Desc: string;
    mod6Title: string;
    mod6Desc: string;
  };
  metrics: {
    sectionBadge: string;
    heading: string;
    subhead: string;
    sampleNotice: string;
    metric1Val: string;
    metric1Label: string;
    metric1Delta: string;
    metric2Val: string;
    metric2Label: string;
    metric2Delta: string;
    metric3Val: string;
    metric3Label: string;
    metric3Delta: string;
    metric4Val: string;
    metric4Label: string;
    metric4Delta: string;
    quote1Text: string;
    quote1Author: string;
    quote1Role: string;
    quote1Company: string;
    quote1Link: string;
    quote2Text: string;
    quote2Author: string;
    quote2Role: string;
    quote2Company: string;
    quote2Link: string;
  };
  integrations: {
    sectionBadge: string;
    heading: string;
    subhead: string;
    ctaButton: string;
  };
  finalCta: {
    heading: string;
    subhead: string;
    primaryButton: string;
    secondaryButton: string;
    noCardRequired: string;
  };
  footer: {
    tagline: string;
    ownerPortal: string;
    staffPortal: string;
    customerStore: string;
    privacy: string;
    terms: string;
    rights: string;
  };
  auth: {
    badge: string;
    signInTitle: string;
    signUpTitle: string;
    roleOwner: string;
    roleStaff: string;
    emailOrPhone: string;
    emailOrPhonePlaceholderOwner: string;
    emailOrPhonePlaceholderStaff: string;
    password: string;
    forgotPassword: string;
    rememberDevice: string;
    signInButton: string;
    noAccountPrompt: string;
    signUpAction: string;
    haveAccountPrompt: string;
    signInAction: string;
    fullName: string;
    fullNamePlaceholder: string;
    storeName: string;
    storeNamePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    businessType: string;
    businessRetail: string;
    businessRestaurant: string;
    businessServices: string;
    businessWholesale: string;
    inviteCode: string;
    inviteCodePlaceholder: string;
    stepBusinessInfo: string;
    stepAccount: string;
    nextStep: string;
    prevStep: string;
    createStoreAction: string;
    passwordStrength: string;
    strengthLevels: string[];
    termsNotice: string;
    verifiedTitle: string;
    ownerSuccessMessage: string;
    staffSuccessMessage: string;
    close: string;
  };
  showcase: {
    badge: string;
    title: string;
    subtitle: string;
    playSimulation: string;
    pauseSimulation: string;
    resetSimulation: string;
    tabs: {
      guide: string;
      storefront: string;
      pos: string;
      dashboard: string;
    };
    journey: {
      step1Title: string;
      step1Desc: string;
      step1Alert: string;
      step2Title: string;
      step2Desc: string;
      step2Alert: string;
      step3Title: string;
      step3Desc: string;
      step3Alert: string;
      step4Title: string;
      step4Desc: string;
      step4Alert: string;
      step5Title: string;
      step5Desc: string;
      step5Alert: string;
    };
    storefront: {
      productTitle: string;
      productCategory: string;
      productPrice: string;
      inStockBadge: string;
      addToCart: string;
      cartTitle: string;
      checkoutTitle: string;
      payWithMada: string;
      payWithApple: string;
      itemAddedAlert: string;
    };
    pos: {
      terminalTitle: string;
      terminalSubtitle: string;
      cashierLabel: string;
      barcodeScannerActive: string;
      quickCash: string;
      madaCard: string;
      totalWithVat: string;
      inventoryDeductedAlert: string;
    };
    dashboard: {
      orderId: string;
      orderStatus: string;
      acceptOrder: string;
      dispatchShipping: string;
      orderAcceptedAlert: string;
      shippingDispatchedAlert: string;
    };
  };
  surfaces: {
    badge: string;
    title: string;
    subtitle: string;
    tabsAriaLabel: string;
    deviceAriaLabel: string;
    languageAriaLabel: string;
    placeholderBadge: string;
    tabs: {
      storefront: string;
      ownerDashboard: string;
      posTerminal: string;
    };
    devices: {
      desktop: string;
      tablet: string;
      mobile: string;
    };
    languages: {
      en: string;
      ar: string;
    };
    captions: {
      storefront: string;
      ownerDashboard: string;
      posTerminal: string;
    };
    alts: {
      storefrontMain: string;
      storefrontCart: string;
      storefrontStats: string;
      ownerMain: string;
      ownerModal: string;
      ownerStats: string;
      posMain: string;
      posPayment: string;
      posReceipt: string;
    };
  };
  devices: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    stackAriaLabel: string;
    chips: {
      formFactors: string;
      renderLatency: string;
      offlineReady: string;
      oneCodebase: string;
    };
    ctaPrimary: string;
    ctaSecondary: string;
    items: {
      mobile: {
        tag: string;
        title: string;
        desc: string;
      };
      tablet: {
        tag: string;
        title: string;
        desc: string;
      };
      laptop: {
        tag: string;
        title: string;
        desc: string;
      };
      desktop: {
        tag: string;
        title: string;
        desc: string;
      };
      pos: {
        tag: string;
        title: string;
        desc: string;
      };
      tv: {
        tag: string;
        title: string;
        desc: string;
      };
    };
    screenLabels: {
      preparing: string;
      ready: string;
      order: string;
      terminalId: string;
      offlineMode: string;
      charge: string;
      liveStream: string;
      stockStatus: string;
      fastCart: string;
    };
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    meta: {
      title: "Matager — Next Generation of Commerce",
      description:
        "The unified ecommerce ecosystem. Multi-vendor marketplaces, instant payments, autonomous logistics, and real-time telemetry — all through one dark-terminal workspace.",
    },
    nav: {
      brand: "Matager",
      pillars: "Architecture",
      howItWorks: "Flow",
      ecosystem: "Ecosystem",
      metrics: "Telemetry",
      integrations: "Connectors",
      signIn: "Log in",
      getStarted: "Start free",
      customerStore: "Storefront Demo",
      langToggle: "العربية",
    },
    hero: {
      pillBadge: "New: Matager Engine 2.0 • Real-time Multi-Vendor Core",
      brand: "Matager",
      tagline: "Next Generation of Commerce",
      supporting:
        "The dark-terminal command center for modern commerce. Unify multi-vendor storefronts, lightning payments, autonomous logistics, and deep operational telemetry into a single connected platform.",
      primaryCta: "Start free",
      secondaryCta: "Download app",
      trustLine: "Powering 850+ high-velocity enterprise merchants across 24 global markets",
      terminalTab1: "Global Telemetry",
      terminalTab2: "Vendor Ledger",
      terminalTab3: "Real-time POS",
      liveStatus: "Live Stream",
      latency: "11.4 ms avg latency",
      throughput: "3,820 tx/sec",
      activeVendors: "854 active nodes",
      chartTitle: "Ecosystem GMV & Settlements",
      chartSubtitle: "Cross-border volume indexed against multi-rail liquidity (Live)",
    },
    pillars: {
      sectionBadge: "Foundational Capabilities",
      heading: "Engineered for uncompromising commercial velocity.",
      subhead:
        "Four sovereign primitives working together as a frictionless ecosystem, giving enterprise operators total command over complex global sales networks.",
      card1Title: "Unified Storefronts",
      card1Description:
        "Deploy lightning-fast headless consumer experiences and multi-vendor storefronts with zero latency, sub-second TTFB, and localized edge caching.",
      card1Metric: "< 85ms",
      card1MetricLabel: "Edge Storefront TTFB",
      card2Title: "Seamless Payments",
      card2Description:
        "Multi-rail checkout engine with automated cross-border currency conversion, split payouts for vendors, and automated fraud interception.",
      card2Metric: "99.98%",
      card2MetricLabel: "First-Pass Settlement",
      card3Title: "Smart Logistics",
      card3Description:
        "Autonomous fulfillment network dynamically dispatching orders through optimal carrier nodes, regional micro-warehouses, and live IoT GPS tracking.",
      card3Metric: "-34%",
      card3MetricLabel: "Carrier Fulfillment Cost",
      card4Title: "Real-Time Analytics",
      card4Description:
        "Sub-second event streaming tracking vendor performance, customer basket velocity, margin drift, and inventory reorder triggers in real time.",
      card4Metric: "420K",
      card4MetricLabel: "Telemetry Events / Sec",
    },
    howItWorks: {
      sectionBadge: "Operating Model",
      heading: "Three steps from setup to autonomous scale.",
      subhead:
        "Matager eliminates fragmented SaaS silos by binding catalog, vendors, payment rails, and physical fulfillment into one continuous pipeline.",
      step1Num: "01",
      step1Title: "Deploy Storefront & Master Catalog",
      step1Desc:
        "Connect your product catalog and onboarding rules in seconds. Launch high-converting headless storefronts with pre-built checkout modules.",
      step2Num: "02",
      step2Title: "Unify Payments & Vendor Settlements",
      step2Desc:
        "Plug in global payment gateways with automated escrow, split payments, instant vendor commissions, and automated tax withholding.",
      step3Num: "03",
      step3Title: "Automate Fulfillment & Growth Telemetry",
      step3Desc:
        "Let the autonomous logistics engine coordinate multi-carrier shipping while the central telemetry terminal projects growth vectors.",
    },
    ecosystem: {
      sectionBadge: "Modular Platform",
      heading: "One unified ecosystem. Infinite retail topologies.",
      subhead:
        "Activate specialized modules with a single toggle. Every layer shares a single unified data model with zero synchronization delay.",
      mod1Title: "Multi-Vendor Marketplace Core",
      mod1Desc: "Autonomous vendor onboarding, KYC verification, commission schedules, and dedicated merchant portals.",
      mod2Title: "Omnichannel POS & Register",
      mod2Desc: "Instant offline-ready cashier terminals with barcode scanning, barcode generation, and hardware printer hooks.",
      mod3Title: "Intelligent Inventory Matrix",
      mod3Desc: "Unified SKU tracking across distributed physical warehouses, drop-ship vendors, and retail outlets.",
      mod4Title: "Automated Tax & Global Compliance",
      mod4Desc: "Dynamic multi-jurisdiction VAT/GST calculation, automated invoicing, and compliant audit trails.",
      mod5Title: "Autonomous Carrier Dispatch",
      mod5Desc: "Real-time rate bargaining, automated shipping label generation, and automated rider handover workflows.",
      mod6Title: "Customer Cohort Intelligence",
      mod6Desc: "Deep purchase behavioral clustering, predictive repurchase prompts, and personalized basket incentives.",
    },
    metrics: {
      sectionBadge: "Verified Telemetry",
      heading: "Proven resilience at mission-critical volume.",
      subhead:
        "Built to withstand high-concurrency seasonal drops, flash sales, and continuous enterprise transaction volume.",
      sampleNotice: "Live Production Benchmark Telemetry (Sample Data Feed)",
      metric1Val: "$42.8M",
      metric1Label: "GMV Processed Monthly",
      metric1Delta: "+68% YoY",
      metric2Val: "99.99%",
      metric2Label: "Global Core Uptime",
      metric2Delta: "<12ms Ping",
      metric3Val: "1.24M+",
      metric3Label: "Transactions Daily",
      metric3Delta: "+94% Throughput",
      metric4Val: "850+",
      metric4Label: "Enterprise Merchants",
      metric4Delta: "24 Countries",
      quote1Text:
        "Matager replaced five disconnected SaaS subscriptions with a single obsidian terminal. Our multi-vendor onboarding time collapsed from weeks to minutes, and checkout conversion jumped 23%.",
      quote1Author: "Tariq Al-Mansoor",
      quote1Role: "VP of Digital Commerce",
      quote1Company: "Aura Retail Group",
      quote1Link: "Read case study →",
      quote2Text:
        "The terminal-style observability is unlike anything else in retail tech. We monitor inventory shifts and cross-border settlement in sub-second telemetry.",
      quote2Author: "Elena Rostova",
      quote2Role: "Chief Technology Officer",
      quote2Company: "Vanguard Global Goods",
      quote2Link: "Read case study →",
    },
    integrations: {
      sectionBadge: "Interoperability",
      heading: "Native connectivity to your existing commercial stack.",
      subhead:
        "Seamlessly bridge payment rails, global freight carriers, ERP backbones, and accounting ledgers with zero custom middleware.",
      ctaButton: "Explore all 750+ integrations",
    },
    finalCta: {
      heading: "Ready to command the next generation of commerce?",
      subhead:
        "Deploy your high-velocity storefront, connect your vendors, and experience the dark observatory terminal designed for serious operators.",
      primaryButton: "Start free now",
      secondaryButton: "Download app",
      noCardRequired: "No credit card required • Production sandbox ready in 90 seconds",
    },
    footer: {
      tagline: "The unified multi-vendor commerce OS & telemetry terminal.",
      ownerPortal: "Owner Portal",
      staffPortal: "Staff Terminal",
      customerStore: "Customer Storefront",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "Matager Inc. All rights reserved.",
    },
    auth: {
      badge: "Matager Unified Access",
      signInTitle: "Sign In to Matager",
      signUpTitle: "Create your Matager account",
      roleOwner: "Store Owner",
      roleStaff: "Staff / Cashier",
      emailOrPhone: "Email or Phone",
      emailOrPhonePlaceholderOwner: "owner@store.com",
      emailOrPhonePlaceholderStaff: "cashier@store.com",
      password: "Password",
      forgotPassword: "Forgot password?",
      rememberDevice: "Remember device for 30 days",
      signInButton: "Sign In to Workspace",
      noAccountPrompt: "Don't have a store account?",
      signUpAction: "Sign Up",
      haveAccountPrompt: "Already registered?",
      signInAction: "Sign In",
      fullName: "Full Name",
      fullNamePlaceholder: "John Doe",
      storeName: "Store Name",
      storeNamePlaceholder: "Apex Store",
      phone: "Phone Number",
      phonePlaceholder: "+1 (555) 000-0000",
      businessType: "Business Category",
      businessRetail: "Retail & Multi-Vendor",
      businessRestaurant: "Food & Beverage",
      businessServices: "Services & Digital Goods",
      businessWholesale: "Wholesale & Distribution",
      inviteCode: "Store Invite Code",
      inviteCodePlaceholder: "MTG-INV-8849",
      stepBusinessInfo: "Store Identity",
      stepAccount: "Account Credentials",
      nextStep: "Continue",
      prevStep: "Back",
      createStoreAction: "Launch Workspace",
      passwordStrength: "Password Security",
      strengthLevels: ["Very weak", "Fair", "Good", "Strong", "Enterprise-grade"],
      termsNotice: "By continuing, you agree to Matager's Terms of Service and Privacy Policy.",
      verifiedTitle: "Authenticated",
      ownerSuccessMessage: "Welcome back! Directing to Store Command Center...",
      staffSuccessMessage: "Verified! Launching POS Cashier Terminal...",
      close: "Close",
    },
    showcase: {
      badge: "Live Commerce Simulator & Architecture Guide",
      title: "How Matager Works — End-to-End Orchestration",
      subtitle: "Explore the live customer storefront, POS cashier workstation, and central admin telemetry — with real-time lifecycle synchronization from customer cart to courier dispatch.",
      playSimulation: "Play Live Order Flow",
      pauseSimulation: "Pause Simulation",
      resetSimulation: "Reset Flow",
      tabs: {
        guide: "🔄 Live Order Journey",
        storefront: "🛍️ Customer Storefront",
        pos: "⚡ POS Cashier Terminal",
        dashboard: "📊 Unified Admin Dashboard",
      },
      journey: {
        step1Title: "1. Customer Browses & Adds to Cart",
        step1Desc: "Customer browses online storefront and selects premium item.",
        step1Alert: "Customer added Titanium Headphones to basket (#Cart-492)",
        step2Title: "2. Payment Selection & Checkout",
        step2Desc: "Instant clearance through local payment rails (Apple Pay / Mada / Visa).",
        step2Alert: "Payment Authorized: $189.00 via Mada • Zero fraud flags",
        step3Title: "3. Admin Telemetry & Instant Acceptance",
        step3Desc: "Order #MTG-9402 lands on Admin Terminal with real-time audio-visual alert.",
        step3Alert: "Admin Terminal: Order #MTG-9402 accepted & routed to fulfillment",
        step4Title: "4. Omnichannel POS & Inventory Sync",
        step4Desc: "Stock is deducted instantaneously across all physical registers and online nodes.",
        step4Alert: "POS Sync: Branch inventory updated from 48 -> 47 in 12ms",
        step5Title: "5. Autonomous Logistics & Carrier Dispatch",
        step5Desc: "API generates electronic waybill & assigns nearest courier.",
        step5Alert: "Logistics: Waybill #SA-88294 issued • Courier dispatched for pickup",
      },
      storefront: {
        productTitle: "Matager Pro Studio Headphones",
        productCategory: "High-Fidelity Audio • Wireless ANC",
        productPrice: "$189.00",
        inStockBadge: "In Stock (48 left)",
        addToCart: "Add to Cart",
        cartTitle: "Your Shopping Bag (1 Item)",
        checkoutTitle: "Express Checkout",
        payWithMada: "Pay with Mada Card",
        payWithApple: "Apple Pay Instant",
        itemAddedAlert: "✓ Added to your basket!",
      },
      pos: {
        terminalTitle: "Matager POS Workstation",
        terminalSubtitle: "Branch: Riyadh Flagship • Terminal #04",
        cashierLabel: "Cashier: Omar K. (Active)",
        barcodeScannerActive: "Barcode Scanner Active",
        quickCash: "💵 Cash Pay",
        madaCard: "💳 Mada / NFC Tap",
        totalWithVat: "Total (incl. 15% VAT)",
        inventoryDeductedAlert: "⚡ SKU-771 stock deducted across POS cluster",
      },
      dashboard: {
        orderId: "Order #MTG-9402",
        orderStatus: "Awaiting Fulfillment",
        acceptOrder: "Accept & Dispatch",
        dispatchShipping: "Print Waybill & Ship",
        orderAcceptedAlert: "Order #MTG-9402 accepted by Store Admin",
        shippingDispatchedAlert: "Courier SMSA Express notified for pickup",
      },
    },
    surfaces: {
      badge: "ENTERPRISE OMNICHANNEL INFRASTRUCTURE",
      title: "One Operating System. Every Enterprise Surface.",
      subtitle:
        "Architected for high-velocity conglomerates and flagship retail networks. Orchestrating consumer mobile storefronts, warehouse floor tablets, HQ command matrix, and hardware POS registers from a single synchronized state engine.",
      tabsAriaLabel: "Matager product surfaces",
      deviceAriaLabel: "Select device viewport",
      languageAriaLabel: "Select preview language",
      placeholderBadge: "SCREENSHOT PLACEHOLDER",
      tabs: {
        storefront: "Storefront",
        ownerDashboard: "Store Owner Dashboard",
        posTerminal: "Cashier Terminal (POS)",
      },
      devices: {
        desktop: "Desktop",
        tablet: "Tablet",
        mobile: "Mobile",
      },
      languages: {
        en: "EN",
        ar: "العربية",
      },
      captions: {
        storefront:
          "High-conversion consumer storefront with sub-second catalog browsing, instant multi-payment checkout, and real-time inventory synchronization.",
        ownerDashboard:
          "Unified merchant control plane for real-time inventory management, financial settlement telemetry, multi-branch routing, and cross-channel orders.",
        posTerminal:
          "Resilient in-store checkout terminal with offline capability, hardware peripheral integration, barcode scanner interface, and instant ledger sync.",
      },
      alts: {
        storefrontMain: "Matager Storefront catalog and hero showcase",
        storefrontCart: "Slide-out shopping cart and instant checkout drawer",
        storefrontStats: "Live stock availability and estimated delivery badge",
        ownerMain: "Matager Merchant HQ dashboard with telemetry and KPI cards",
        ownerModal: "Quick product editor modal with pricing and inventory rules",
        ownerStats: "Consolidated payout schedule and low-stock telemetry card",
        posMain: "High-speed cashier POS interface with barcode scanner and ticket register",
        posPayment: "Payment tender modal with NFC, cash keypad, and split payment",
        posReceipt: "Digital tax invoice and instant thermal receipt preview",
      },
    },
    devices: {
      eyebrow: "DEVICE_MATRIX / 06 FORM FACTORS",
      heading: "Native on every screen. Built for every counter.",
      subtitle:
        "From the phone in your pocket to the cashier terminal and the TV above your counter, Matager adapts its layout, input model, and density to each screen. One system, zero compromises.",
      stackAriaLabel:
        "Interactive cross-platform device showcase demonstrating Matager on mobile, tablet, laptop, desktop PC, cashier POS terminal, and TV display.",
      chips: {
        formFactors: "6 form factors",
        renderLatency: "<85ms render",
        offlineReady: "Offline-ready POS",
        oneCodebase: "One codebase",
      },
      ctaPrimary: "Start free",
      ctaSecondary: "Download app",
      items: {
        mobile: {
          tag: "DEVICE_01",
          title: "Mobile",
          desc: "Shop, track and manage on the go. Thumb-first navigation.",
        },
        tablet: {
          tag: "DEVICE_02",
          title: "Tablet",
          desc: "Floor-ready catalog and order management.",
        },
        laptop: {
          tag: "DEVICE_03",
          title: "Laptop",
          desc: "Full vendor dashboard with live telemetry.",
        },
        desktop: {
          tag: "DEVICE_04",
          title: "Desktop",
          desc: "Multi-pane analytics and bulk catalog tools.",
        },
        pos: {
          tag: "DEVICE_05",
          title: "Cashier Terminal",
          desc: "Touch POS with barcode, offline mode and receipt printing.",
        },
        tv: {
          tag: "DEVICE_06",
          title: "TV / Display",
          desc: "Live order boards, queue screens and branch KPIs.",
        },
      },
      screenLabels: {
        preparing: "Preparing",
        ready: "Ready for Pickup",
        order: "Order",
        terminalId: "POS #01",
        offlineMode: "Offline Ready",
        charge: "Charge",
        liveStream: "Live Telemetry",
        stockStatus: "In Stock",
        fastCart: "Cart",
      },
    },
  },
  ar: {
    meta: {
      title: "متاجر — الجيل القادم من منصات التجارة الإلكترونية",
      description:
        "منظومة التجارة المتكاملة. أسواق متعددة التجار، بوابات دفع فورية، لوجستيات ذكية، وتحليلات فورية — جميعها في منصة موحدة فائقة الدقة.",
    },
    nav: {
      brand: "متاجر",
      pillars: "الهيكلية",
      howItWorks: "آلية العمل",
      ecosystem: "المنظومة",
      metrics: "المؤشرات الحية",
      integrations: "الربط التقني",
      signIn: "تسجيل الدخول",
      getStarted: "ابدأ مجاناً",
      customerStore: "متجر العملاء",
      langToggle: "English",
    },
    hero: {
      pillBadge: "جديد: محرك متاجر 2.0 • قلب رقمي فائق السرعة للأسواق المتعددة",
      brand: "متاجر",
      tagline: "الجيل القادم من التجارة",
      supporting:
        "مركز القيادة والتحكم المتقدم للتجارة العصرية. وحّد واجهات المتاجر متعددة البائعين، وبوابات الدفع اللحظية، والخدمات اللوجستية الذكية، والمؤشرات التشغيلية الفورية في منصة متكاملة وواحدة.",
      primaryCta: "ابدأ مجاناً",
      secondaryCta: "تحميل التطبيق",
      trustLine: "يدعم أكثر من 850 علامة تجارية رائدة وأسواق كبرى في 24 دولة",
      terminalTab1: "المؤشرات العالمية",
      terminalTab2: "دفتر حسابات التجار",
      terminalTab3: "نقاط البيع الفورية",
      liveStatus: "بث مباشر للبيانات",
      latency: "11.4 مللي ثانية زمن استجابة",
      throughput: "3,820 عملية / ثانية",
      activeVendors: "854 عقدة متجر نشطة",
      chartTitle: "إجمالي حجم البضائع والتسويات المالية",
      chartSubtitle: "حجم المعاملات العابرة للحدود مقابل السيولة متعددة المسارات (مباشر)",
    },
    pillars: {
      sectionBadge: "القدرات الجوهرية",
      heading: "مصممة خصيصاً للسرعة والكفاءة التجارية القصوى.",
      subhead:
        "أربع ركائز سيادية تعمل معاً بانسجام تام، لتمكين قادة الأعمال من إدارة شبكات البيع المعقدة بسهولة ودقة متناهية.",
      card1Title: "واجهات متاجر موحدة",
      card1Description:
        "أطلق واجهات تسوق فائقة السرعة ومتعددة التجار بدون أي تأخير، مع زمن وصول لأول بايت أقل من جزء من الثانية وذاكرة تخزين مؤقت موزعة عالمياً.",
      card1Metric: "< 85ms",
      card1MetricLabel: "زمن استجابة واجهة المتجر",
      card2Title: "مدفوعات فورية متكاملة",
      card2Description:
        "محرك دفع متعدد المسارات يدعم التحويل الفوري للعملات، وتوزيع العوائد التلقائي للتجار، والحماية الذكية من محاولات الاحتيال.",
      card2Metric: "99.98%",
      card2MetricLabel: "نسبة نجاح التسويات",
      card3Title: "لوجستيات ذكية ومؤتمتة",
      card3Description:
        "شبكة شحن وتوصيل ذاتية توجه الطلبات ديناميكياً عبر أفضل شركات الشحن والمستودعات الإقليمية مع تتبع مباشر بالـ GPS.",
      card3Metric: "-34%",
      card3MetricLabel: "انخفاض تكاليف الشحن",
      card4Title: "تحليلات تشغيلية حية",
      card4Description:
        "بث فوري لأحداث البيع يراقب أداء المتاجر، سرعة سلة المشتريات، تغيرات هوامش الربح، ومؤشرات إعادة طلب المخزون لحظة بلحظة.",
      card4Metric: "420K",
      card4MetricLabel: "حدث قياس / ثانية",
    },
    howItWorks: {
      sectionBadge: "نموذج التشغيل",
      heading: "ثلاث خطوات فقط من الإطلاق إلى التوسع الذاتي.",
      subhead:
        "تقضي منصة متاجر على فوضى البرمجيات المتفرقة عبر دمج إدارة المنتجات، والتجار، ومسارات الدفع، والتوصيل في خط تدفق موحد.",
      step1Num: "01",
      step1Title: "إطلاق المتجر وكتالوج المنتجات المركزي",
      step1Desc:
        "اربط كتالوج المنتجات وقواعد انضمام التجار في ثوانٍ. ابدأ بواجهات متطورة توفر تجربة شراء سلسة ومحسنة للتحويل.",
      step2Num: "02",
      step2Title: "توحيد المدفوعات وتسويات البائعين",
      step2Desc:
        "ادمج بوابات الدفع العالمية والمحلية بنظام حجز مالي تلقائي، وتوزيع عمولات لحظي، وحساب ضريبي مؤتمت.",
      step3Num: "03",
      step3Title: "أتمتة الشحن وقراءة مؤشرات النمو",
      step3Desc:
        "دع محرك اللوجستيات الذكي ينسق الشحن مع مختلف الشركات بينما تعرض شاشة المؤشرات مسارات النمو والتوسع المستمر.",
    },
    ecosystem: {
      sectionBadge: "المنظومة المتكاملة",
      heading: "منصة واحدة موحدة. هياكل تجارة لا حصر لها.",
      subhead:
        "فعّل الوحدات المتخصصة بضغطة زر واحدة. تشترك جميع الوحدات في نموذج بيانات موحد فائق الدقة وبدون أي تأخير في التزامن.",
      mod1Title: "محرك السوق متعدد التجار",
      mod1Desc: "انضمام ذاتي للبائعين، والتحقق التلقائي من الهوية، وجداول العمولات، وبوابات إدارة مستقلة لكل تاجر.",
      mod2Title: "نظام نقاط البيع والكاشير الموحد",
      mod2Desc: "محطات كاشير تدعم العمل دون اتصال، مع قارئ الباركود، وتوليد الفواتير، والربط بطابعات الإيصالات.",
      mod3Title: "مصفوفة المخزون الذكية",
      mod3Desc: "تتبع موحد لجميع الأصناف عبر المستودعات الموزعة، وموردي الدروب شيبينغ، ومنافذ البيع بالتجزئة.",
      mod4Title: "الضرائب المؤتمتة والامتثال المالي",
      mod4Desc: "حساب ضريبة القيمة المضافة ديناميكياً لمختلف المناطق، مع إصدار الفواتير الضريبية وسجلات التدقيق.",
      mod5Title: "التوزيع الذاتي للشحنات",
      mod5Desc: "مفاضلة أسعار الشحن في الوقت الفعلي، وإصدار بوليصات الشحن آلياً، وتتبع مناديب التوصيل بسلاسة.",
      mod6Title: "ذكاء سلوك العملاء والشرائح",
      mod6Desc: "تجميع سلوكي متقدم لبيانات الشراء، وتوقع فترات إعادة الطلب، وتقديم عروض سلة مخصصة ترفع المبيعات.",
    },
    metrics: {
      sectionBadge: "مؤشرات موثقة",
      heading: "مرونة مثبتة في أوقات الذروة وأضخم أحجام المبيعات.",
      subhead:
        "مهندسة لتحمل الإقبال العالي في مواسم التخفيضات ومبيعات الفلاش مع استقرار تام للمنظومة.",
      sampleNotice: "مؤشرات اختبارية حية من بيئة التشغيل التجريبية (بيانات توضيحية)",
      metric1Val: "$42.8M",
      metric1Label: "إجمالي المبيعات المعالجة شهرياً",
      metric1Delta: "+68% نمو سنوي",
      metric2Val: "99.99%",
      metric2Label: "جاهزية واستقرار الخوادم",
      metric2Delta: "<12ms استجابة",
      metric3Val: "1.24M+",
      metric3Label: "معاملة تجارية يومياً",
      metric3Delta: "+94% كفاءة التدفق",
      metric4Val: "850+",
      metric4Label: "تاجر وعلامة تجارية كبرى",
      metric4Delta: "24 دولة حول العالم",
      quote1Text:
        "استبدلت منصة متاجر خمس اشتراكات برمجية متباعدة بشاشة تحكم موحدة فائقة الدقة. انخفض وقت انضمام التجار من أسابيع إلى دقائق، وارتفع معدل التحويل بنسبة 23%.",
      quote1Author: "طارق المنصور",
      quote1Role: "نائب رئيس قطاع التجارة الرقمية",
      quote1Company: "مجموعة أورا للتجزئة",
      quote1Link: "قراءة دراسة الحالة ←",
      quote2Text:
        "وضوح الرؤية والمراقبة المباشرة في المنصة يتفوق على أي نظام تجزئة تقليدي. نحن نتابع تحركات المخزون والتسويات الدولية ببيانات دقيقة في أجزاء من الثانية.",
      quote2Author: "إلينا روستوفا",
      quote2Role: "الرئيس التنفيذي للتكنولوجيا",
      quote2Company: "فانغارد للسلع العالمية",
      quote2Link: "قراءة دراسة الحالة ←",
    },
    integrations: {
      sectionBadge: "التكامل والربط",
      heading: "ربط سلس ومباشر مع منظومتك التجارية الحالية.",
      subhead:
        "وصّل بوابات الدفع، وشركات الشحن العالمية، وأنظمة تخطيط الموارد (ERP)، ودفاتر المحاسبة دون الحاجة لكتابة برمجيات وسيطة معقدة.",
      ctaButton: "استعرض كافة الروابط التقنية (+750 خدمة)",
    },
    finalCta: {
      heading: "هل أنت مستعد لقيادة الجيل القادم من التجارة؟",
      subhead:
        "أطلق متجرك المتقدم، واربط شبكة تجارك، واكتشف منصة المراقبة والتحكم المصممة لقادة التجارة الجادين.",
      primaryButton: "ابدأ الآن مجاناً",
      secondaryButton: "تحميل التطبيق",
      noCardRequired: "لا تتطلب بطاقة ائتمان • بيئة تجريبية كاملة جاهزة خلال 90 ثانية",
    },
    footer: {
      tagline: "نظام تشغيل التجارة متعددة المتاجر وشاشة المؤشرات التشغيلية الموحدة.",
      ownerPortal: "بوابة المالك",
      staffPortal: "بوابة الموظفين",
      customerStore: "متجر العملاء",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      rights: "جميع الحقوق محفوظة لشركة متاجر.",
    },
    auth: {
      badge: "مصادقة متاجر الموحدة",
      signInTitle: "تسجيل الدخول إلى متاجر",
      signUpTitle: "إنشاء حساب متجر جديد",
      roleOwner: "صاحب المتجر",
      roleStaff: "كاشير / موظف المتجر",
      emailOrPhone: "البريد الإلكتروني أو رقم الهاتف",
      emailOrPhonePlaceholderOwner: "owner@store.com",
      emailOrPhonePlaceholderStaff: "cashier@store.com",
      password: "كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      rememberDevice: "تذكر هذا الجهاز لمدة 30 يوماً",
      signInButton: "تسجيل الدخول إلى مساحة العمل",
      noAccountPrompt: "ليس لديك حساب متجر؟",
      signUpAction: "سجّل الآن",
      haveAccountPrompt: "هل لديك حساب بالفعل؟",
      signInAction: "تسجيل الدخول",
      fullName: "الاسم الكامل",
      fullNamePlaceholder: "عبدالله السعيد",
      storeName: "اسم المتجر",
      storeNamePlaceholder: "متجر الأناقة الحديثة",
      phone: "رقم الجوال",
      phonePlaceholder: "+966 50 123 4567",
      businessType: "نوع النشاط التجاري",
      businessRetail: "تجارة التجزئة والأسواق",
      businessRestaurant: "المطاعم والمقاهي",
      businessServices: "الخدمات والمنتجات الرقمية",
      businessWholesale: "تجارة الجملة والتوزيع",
      inviteCode: "رمز دعوة المتجر",
      inviteCodePlaceholder: "MTG-INV-8849",
      stepBusinessInfo: "بيانات المتجر والنشاط",
      stepAccount: "بيانات الحساب وكلمة المرور",
      nextStep: "المتابعة للخطوة التالية",
      prevStep: "الرجوع",
      createStoreAction: "إطلاق مساحة العمل",
      passwordStrength: "مستوى أمان كلمة المرور",
      strengthLevels: ["ضعيفة جداً", "مقبولة", "جيدة", "قوية", "فائقة الأمان للمؤسسات"],
      termsNotice: "بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية لمنصة متاجر.",
      verifiedTitle: "تم التحقق بنجاح",
      ownerSuccessMessage: "أهلاً بك مجدداً! جاري تحويلك إلى لوحة تحكم المتجر...",
      staffSuccessMessage: "تم التحقق! جاري تشغيل شاشة الكاشير ونقاط البيع...",
      close: "إغلاق",
    },
    showcase: {
      badge: "دليل المحاكاة التفاعلية الحية وهيكلية العمل",
      title: "آلية عمل منصة متاجر — دورة الطلب المتكاملة",
      subtitle: "استكشف تجربة واجهة المتجر للعملاء، ومحطة كاشير نقاط البيع (POS)، ولوحة تحكم الإدارة المركزية، مع تتبع فوري لدورة حياة الطلب من الإضافة للسلة حتى إصدار البوليصة وتسليم المندوب.",
      playSimulation: "تشغيل محاكاة دورة الطلب",
      pauseSimulation: "إيقاف مؤقت",
      resetSimulation: "إعادة البدء",
      tabs: {
        guide: "🔄 جولة محاكاة دورة الطلب",
        storefront: "🛍️ متجر العملاء الإلكتروني",
        pos: "⚡ كاشير نقطة البيع (POS)",
        dashboard: "📊 لوحة تحكم الإدارة المركزية",
      },
      journey: {
        step1Title: "1. العميل يتصفح المتجر ويضيف للسلة",
        step1Desc: "يتصفح العميل واجهة المتجر الإلكتروني السريعة ويختار منتجه المفضل.",
        step1Alert: "أضاف العميل سماعات استوديو بريميوم للسلة (#Cart-492)",
        step2Title: "2. اختيار وسيلة الدفع وإتمام الطلب",
        step2Desc: "تسوية فورية عبر مسارات الدفع المعتمدة (مدى / Apple Pay / فيزا).",
        step2Alert: "تم تفويض الدفع: 189.00 $ عبر مدى • فحص أمني ناجح 100%",
        step3Title: "3. وصول الطلب للوحة تحكم الإدارة والموافقة",
        step3Desc: "يصل الطلب #MTG-9402 لحظياً لشاشة الإدارة مع إشعار صوتي ومرئي.",
        step3Alert: "لوحة الإدارة: تم قبول الطلب #MTG-9402 وجاري توجيهه للتجهيز",
        step4Title: "4. مزامنة فورية مع كاشير نقاط البيع (POS)",
        step4Desc: "يتم خصم كمية المنتج فوراً من مخزون الفروع المادية والمخازن في جزء من الثانية.",
        step4Alert: "تزامن POS: تم تحديث كمية المخزون من 48 إلى 47 خلال 12ms",
        step5Title: "5. الربط اللوجستي الآلي وإسناد الشحنة للمندوب",
        step5Desc: "إصدار تلقائي لبوليصة الشحن الإلكترونية وإشعار أقرب شركة شحن للاستلام.",
        step5Alert: "اللوجستيات: تم توليد بوليصة #SA-88294 • المندوب في طريقه للاستلام",
      },
      storefront: {
        productTitle: "سماعات متاجر بريميوم الاحترافية",
        productCategory: "صوت نقي عالي الدقة • عزل ضوضاء لاسلكي",
        productPrice: "189.00 $",
        inStockBadge: "متوفر بالمخزون (متبقي 48 قطعة)",
        addToCart: "إضافة إلى السلة",
        cartTitle: "سلة المشتريات (عنصر واحد)",
        checkoutTitle: "الدفع السريع",
        payWithMada: "الدفع ببطاقة مدى",
        payWithApple: "Apple Pay فوري",
        itemAddedAlert: "✓ تم الإضافة إلى سلتك بنجاح!",
      },
      pos: {
        terminalTitle: "محطة كاشير نقاط البيع (POS)",
        terminalSubtitle: "الفرع: فرع الرياض الرئيسي • نقطة #04",
        cashierLabel: "الكاشير: عمر خالد (نشط)",
        barcodeScannerActive: "قارئ الباركود متصل وجاهز",
        quickCash: "💵 دفع نقدي",
        madaCard: "💳 مدى / تمرير جوال NFC",
        totalWithVat: "الإجمالي (شامل 15% ضريبة)",
        inventoryDeductedAlert: "⚡ تم خصم الصنف SKU-771 من شبكة نقاط البيع",
      },
      dashboard: {
        orderId: "الطلب رقم #MTG-9402",
        orderStatus: "بانتظار التجهيز والشحن",
        acceptOrder: "قبول الطلب وتوجيهه",
        dispatchShipping: "طباعة البوليصة والشحن",
        orderAcceptedAlert: "تم قبول الطلب #MTG-9402 من مدير المتجر",
        shippingDispatchedAlert: "تم إرسال إشعار استلام الشحنة لشركة سمسا إكسبريس",
      },
    },
    surfaces: {
      badge: "منظومة الأجهزة الموحدة للشركات الكبرى",
      title: "نظام تشغيل واحد. لكل شاشة ومنفذ بيع.",
      subtitle:
        "بنية تحتية موحدة مصممة للشركات والمجموعات التجارية الرائدة — تنسق وتزامن واجهات المتجر للجوال، أجهزة التابلت بالمخازن، منصة القيادة بالمقر الرئيسي، وماكينات الكاشير POS في الوقت الفعلي وبدون تأخير.",
      tabsAriaLabel: "شاشات ومنظومات منصة متاجر",
      deviceAriaLabel: "اختر نوع شاشة العرض",
      languageAriaLabel: "اختر لغة واجهة العرض",
      placeholderBadge: "موضع لقطة الشاشة",
      tabs: {
        storefront: "واجهة المتجر",
        ownerDashboard: "لوحة تحكم التاجر",
        posTerminal: "محطة نقاط البيع (POS)",
      },
      devices: {
        desktop: "سطح المكتب",
        tablet: "جهاز لوحي",
        mobile: "هاتف جوال",
      },
      languages: {
        en: "EN",
        ar: "العربية",
      },
      captions: {
        storefront:
          "واجهة متجر استهلاكية فائقة السرعة مع تصفح فوري للكتالوج، بوابات دفع متعددة وفورية، ومزامنة حية للمخزون.",
        ownerDashboard:
          "لوحة تحكم مركزية متقدمة للتاجر لإدارة المخزون الفوري، التسويات المالية المباشرة، التوجيه الذكي للفروع، والتحليلات الشاملة.",
        posTerminal:
          "محطة كاشير حضورية سريعة وموثوقة تعمل حتى بدون اتصال بالإنترنت مع دعم قارئات الباركود والملحقات الهاردوير والمزامنة اللحظية.",
      },
      alts: {
        storefrontMain: "كتالوج واجهة متجر متاجر والبانر الترويجي",
        storefrontCart: "سلة التسوق الجانبية ونافذة الدفع السريع",
        storefrontStats: "مؤشر توفر المخزون الحي وتقدير سرعة التوصيل",
        ownerMain: "لوحة قيادة التاجر الرئيسية مع مؤشرات الأداء والتحليلات الحية",
        ownerModal: "نافذة التعديل السريع للمنتجات وقواعد التسعير والمخزون",
        ownerStats: "جدول التسويات المالية وتنبيهات نواقص المخزون",
        posMain: "واجهة كاشير POS عالية السرعة مع قارئ الباركود وسجل الفاتورة",
        posPayment: "نافذة تحصيل الدفع مع تمرير البطاقة والنقد وتقسيم الفاتورة",
        posReceipt: "الفاتورة الضريبية الرقمية ومعاينة الإيصال الحراري الفوري",
      },
    },
    devices: {
      eyebrow: "مصفوفة الأجهزة / ٦ أحجام شاشات",
      heading: "يعمل أصلاً على كل شاشة. ومصمم لكل كاونتر.",
      subtitle:
        "من الهاتف في جيبك إلى شاشة الكاشير والتلفاز فوق الكاونتر، يتكيّف ماتاجر تلقائياً مع كل شاشة في التخطيط وطريقة الإدخال وكثافة العرض. نظام واحد بلا أي تنازلات.",
      stackAriaLabel:
        "عرض تفاعلي لتوافق ماتاجر عبر مختلف الأجهزة: الجوال، التابلت، اللابتوب، الكمبيوتر المكتبي، محطة الكاشير، وشاشة التلفاز.",
      chips: {
        formFactors: "٦ أحجام شاشات",
        renderLatency: "أقل من 85ms",
        offlineReady: "نقطة بيع تعمل بدون إنترنت",
        oneCodebase: "قاعدة كود واحدة",
      },
      ctaPrimary: "ابدأ مجاناً",
      ctaSecondary: "حمّل التطبيق",
      items: {
        mobile: {
          tag: "DEVICE_01",
          title: "الجوال",
          desc: "تسوق، تتبّع وأدر مبيعاتك أثناء التنقل. تحكم سلس ومصمم للإبهام.",
        },
        tablet: {
          tag: "DEVICE_02",
          title: "التابلت",
          desc: "كتالوج جاهز لصالة العرض وإدارة فورية للطلبات.",
        },
        laptop: {
          tag: "DEVICE_03",
          title: "اللابتوب",
          desc: "لوحة تحكم كاملة للمتاجر مع قياسات أداء حية ومباشرة.",
        },
        desktop: {
          tag: "DEVICE_04",
          title: "الكمبيوتر المكتبي",
          desc: "تحليلات متعددة النوافذ وأدوات إدارة جماعية للكتالوج.",
        },
        pos: {
          tag: "DEVICE_05",
          title: "شاشة الكاشير",
          desc: "نظام كاشير باللمس مع باركود وعمل دون إنترنت وطباعة فواتير.",
        },
        tv: {
          tag: "DEVICE_06",
          title: "شاشة التلفاز",
          desc: "لوحات طلبات حية وشاشات طوابير ومؤشرات أداء للفروع.",
        },
      },
      screenLabels: {
        preparing: "قيد التحضير",
        ready: "جاهز للاستلام",
        order: "طلب",
        terminalId: "كاشير #01",
        offlineMode: "يعمل بدون إنترنت",
        charge: "تحصيل",
        liveStream: "بيانات حية",
        stockStatus: "متوفر",
        fastCart: "السلة",
      },
    },
  },
};
