/**
 * Dalily (دليلى) - Data Layer & Utilities
 * Handles LocalStorage persistence, seed data, SVG graphics, and formatting.
 */

// SVG illustrations for offline product graphics
const PRODUCT_SVGS = {
  case_silicone: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <rect x="42" y="16" width="76" height="128" rx="18" fill="#FF7A00" opacity="0.15"/>
    <rect x="45" y="19" width="70" height="122" rx="16" fill="#0F1F3D"/>
    <rect x="52" y="26" width="28" height="34" rx="8" fill="#1E3258" stroke="#FF7A00" stroke-width="1.5"/>
    <circle cx="60" cy="36" r="4.5" fill="#0F1F3D"/>
    <circle cx="72" cy="36" r="4.5" fill="#0F1F3D"/>
    <circle cx="66" cy="50" r="4.5" fill="#0F1F3D"/>
    <circle cx="66" cy="42" r="2" fill="#FF7A00"/>
    <circle cx="80" cy="84" r="18" fill="none" stroke="#FF7A00" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M80 73 L80 95 M69 84 L91 84" stroke="#FF7A00" stroke-width="1.5" opacity="0.5"/>
  </svg>`,

  case_leather: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <rect x="44" y="18" width="72" height="124" rx="16" fill="#8B4513"/>
    <rect x="47" y="21" width="66" height="118" rx="14" fill="#6B3410" stroke="#FF7A00" stroke-width="1"/>
    <rect x="53" y="28" width="28" height="32" rx="7" fill="#42200A" stroke="#B87333" stroke-width="1.5"/>
    <circle cx="61" cy="37" r="4" fill="#221005"/>
    <circle cx="73" cy="37" r="4" fill="#221005"/>
    <circle cx="67" cy="49" r="4" fill="#221005"/>
    <circle cx="80" cy="85" r="19" fill="none" stroke="#FF7A00" stroke-width="2"/>
    <rect x="79" y="106" width="2" height="8" rx="1" fill="#FF7A00"/>
  </svg>`,

  case_clear: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <rect x="44" y="18" width="72" height="124" rx="16" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="48" y="22" width="64" height="116" rx="13" fill="#FFFFFF" opacity="0.75"/>
    <path d="M48 35 L105 130" stroke="#FFFFFF" stroke-width="3" opacity="0.8"/>
    <rect x="52" y="27" width="26" height="38" rx="8" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5"/>
    <circle cx="65" cy="37" r="4" fill="#0F1F3D"/>
    <circle cx="65" cy="49" r="4" fill="#0F1F3D"/>
    <circle cx="65" cy="59" r="2.5" fill="#FF7A00"/>
  </svg>`,

  screen_9h: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <rect x="46" y="20" width="68" height="120" rx="12" fill="#EBF4FF" stroke="#0F1F3D" stroke-width="1.5"/>
    <path d="M50 30 L110 110" stroke="#FFFFFF" stroke-width="4" opacity="0.7"/>
    <circle cx="80" cy="26" r="2.5" fill="#0F1F3D"/>
    <polygon points="80,55 98,64 98,90 80,105 62,90 62,64" fill="#0F1F3D" opacity="0.1"/>
    <polygon points="80,57 95,65 95,88 80,101 65,88 65,65" fill="#FFFFFF" stroke="#0F1F3D" stroke-width="1.5"/>
    <text x="80" y="85" text-anchor="middle" font-size="14" font-weight="900" fill="#0F1F3D" font-family="sans-serif">9H</text>
  </svg>`,

  screen_privacy: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <rect x="46" y="20" width="68" height="120" rx="12" fill="#1E293B" stroke="#0F1F3D" stroke-width="2"/>
    <circle cx="80" cy="26" r="2.5" fill="#64748B"/>
    <path d="M55 75 Q80 50 105 75 Q80 100 55 75 Z" fill="none" stroke="#FF7A00" stroke-width="2"/>
    <circle cx="80" cy="75" r="6" fill="#FF7A00"/>
    <circle cx="80" cy="75" r="2" fill="#0F1F3D"/>
    <line x1="58" y1="55" x2="102" y2="95" stroke="#FF7A00" stroke-width="2"/>
  </svg>`,

  screen_nano: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <path d="M46 32 C46 25 52 20 60 20 L100 20 C108 20 114 25 114 32 L114 110 C114 125 90 140 70 140 C56 140 46 130 46 118 Z" fill="#E6FFFA" stroke="#1FA971" stroke-width="1.5"/>
    <text x="80" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#1FA971" font-family="sans-serif">NANO</text>
    <path d="M60 92 Q80 102 100 92" stroke="#1FA971" stroke-width="2" fill="none"/>
  </svg>`,

  charger_fast: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <rect x="50" y="42" width="60" height="66" rx="12" fill="#FFFFFF" stroke="#0F1F3D" stroke-width="2"/>
    <rect x="62" y="24" width="8" height="20" rx="3" fill="#94A3B8"/>
    <rect x="90" y="24" width="8" height="20" rx="3" fill="#94A3B8"/>
    <rect x="66" y="86" width="28" height="10" rx="4" fill="#0F1F3D"/>
    <rect x="74" y="90" width="12" height="3" rx="1" fill="#FF7A00"/>
    <polygon points="82,50 72,67 80,67 76,82 89,63 81,63" fill="#FF7A00"/>
    <text x="80" y="126" text-anchor="middle" font-size="11" font-weight="900" fill="#0F1F3D" font-family="sans-serif">33W</text>
  </svg>`,

  charger_magsafe: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <circle cx="80" cy="74" r="40" fill="#FFFFFF" stroke="#0F1F3D" stroke-width="2"/>
    <circle cx="80" cy="74" r="32" fill="#F8FAFC" stroke="#FF7A00" stroke-width="2" stroke-dasharray="4 3"/>
    <circle cx="80" cy="74" r="14" fill="#0F1F3D"/>
    <polygon points="82,68 76,75 80,75 78,81 85,73 81,73" fill="#FF7A00"/>
    <path d="M80 114 L80 144" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  charger_car: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <path d="M60 40 L100 40 L94 95 L88 120 L72 120 L66 95 Z" fill="#0F1F3D"/>
    <circle cx="80" cy="126" r="4" fill="#94A3B8"/>
    <rect x="58" y="70" width="5" height="14" rx="2" fill="#94A3B8"/>
    <rect x="97" y="70" width="5" height="14" rx="2" fill="#94A3B8"/>
    <rect x="68" y="46" width="24" height="6" rx="2" fill="#FF7A00"/>
    <rect x="68" y="58" width="24" height="6" rx="2" fill="#1FA971"/>
    <circle cx="80" cy="74" r="2" fill="#FFFFFF"/>
  </svg>`,

  cable_typec: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <path d="M50 120 Q50 60 80 60 T110 120" fill="none" stroke="#0F1F3D" stroke-width="6" stroke-linecap="round"/>
    <rect x="42" y="112" width="16" height="22" rx="4" fill="#FF7A00"/>
    <rect x="46" y="132" width="8" height="12" rx="2" fill="#CBD5E1"/>
    <rect x="102" y="112" width="16" height="22" rx="4" fill="#0F1F3D"/>
    <rect x="106" y="132" width="8" height="12" rx="2" fill="#CBD5E1"/>
    <text x="80" y="42" text-anchor="middle" font-size="11" font-weight="900" fill="#0F1F3D">TYPE-C</text>
  </svg>`,

  cable_lightning: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <path d="M45 120 C45 60 115 60 115 120" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <path d="M45 120 C45 60 115 60 115 120" fill="none" stroke="#94A3B8" stroke-width="3" stroke-dasharray="2 3"/>
    <rect x="37" y="112" width="16" height="22" rx="4" fill="#0F1F3D"/>
    <rect x="41" y="132" width="8" height="12" rx="2" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1"/>
    <rect x="43" y="135" width="4" height="2" fill="#EAB308"/>
    <rect x="107" y="112" width="16" height="22" rx="4" fill="#FF7A00"/>
    <rect x="110" y="132" width="10" height="12" rx="2" fill="#CBD5E1"/>
    <text x="80" y="40" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F1F3D">LIGHTNING 1M</text>
  </svg>`,

  default_placeholder: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" rx="14" fill="#FFF0E2"/>
    <circle cx="80" cy="80" r="32" fill="#FF7A00" opacity="0.15"/>
    <rect x="68" y="62" width="24" height="36" rx="6" fill="#0F1F3D"/>
    <circle cx="80" cy="74" r="4" fill="#FF7A00"/>
  </svg>`
};

// Seed Stores
const SEED_STORES = [
  {
    id: "store-1",
    name: "الجرابات والإكسسوارات",
    owner: "Store Owner",
    area: "القاهرة - مدينة نصر",
    phone: "01012345678",
    description: "المتجر الأول والرائد لجميع إكسسوارات وجرابات الهواتف الذكية الأصلية بمصر.",
    logo: "",
    status: "approved", // approved, pending, rejected
    createdAt: "2026-10-01",
    totalSales: 1250
  },
  {
    id: "store-2",
    name: "عالم الشواحن",
    owner: "charger_pro",
    area: "الجيزة - الدقي",
    phone: "01198765432",
    description: "أحدث تقنيات الشحن السريع والشواحن اللاسلكية الأصلية المعتمدة.",
    logo: "",
    status: "approved",
    createdAt: "2026-10-05",
    totalSales: 890
  },
  {
    id: "store-3",
    name: "ستايل كيس",
    owner: "style_user",
    area: "الإسكندرية - سموحة",
    phone: "01234567890",
    description: "أحدث صيحات الجرابات العصرية وحماية الهواتف بتصاميم متميزة.",
    logo: "",
    status: "pending", // to demo admin approval workflow
    createdAt: "2026-10-22",
    totalSales: 0
  }
];

// Seed Products (13 initially visible on customer page)
const SEED_PRODUCTS = [
  {
    id: "prod-1",
    storeId: "store-1",
    name: "جراب سيليكون مضاد للصدمات",
    category: "جرابات",
    phoneModel: "iPhone 15 Pro",
    price: 250,
    quantity: 15,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "جراب سيليكون فاخر بطانة ميكروفايبر وحماية معززة لزوايا الهاتف ضد الصدمات والسقوط.",
    sku: "CAS-IP15-01",
    svgKey: "case_silicone",
    imageUrl: ""
  },
  {
    id: "prod-2",
    storeId: "store-1",
    name: "جراب جلد فاخر MagSafe",
    category: "جرابات",
    phoneModel: "iPhone 15 Pro",
    price: 480,
    quantity: 8,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "مصنوع من الجلد الطبيعي المدبوغ خصيصاً مع مغناطيس مدمج متوافق مع كافة ملحقات MagSafe.",
    sku: "CAS-IP15-02",
    svgKey: "case_leather",
    imageUrl: ""
  },
  {
    id: "prod-3",
    storeId: "store-1",
    name: "جراب شفاف مقوى",
    category: "جرابات",
    phoneModel: "Samsung S24 Ultra",
    price: 180,
    quantity: 3, // Limited stock (3)
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "مقاوم للاصفرار بمادة البولي كربونات النقية لإبراز لون الهاتف الأصلي مع حواف مرتفعة لحماية الكاميرا.",
    sku: "CAS-S24-01",
    svgKey: "case_clear",
    imageUrl: ""
  },
  {
    id: "prod-4",
    storeId: "store-1",
    name: "جراب حماية ثقيلة",
    category: "جرابات",
    phoneModel: "Samsung S24 Ultra",
    price: 320,
    quantity: 12,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "درع حماية متكامل متعدد الطبقات مع مسند مدمج للمشاهدة وحماية فائقة ضد الصدمات العنيفة.",
    sku: "CAS-S24-02",
    svgKey: "case_silicone",
    imageUrl: ""
  },
  {
    id: "prod-5",
    storeId: "store-1",
    name: "جراب سيليكون ناعم",
    category: "جرابات",
    phoneModel: "Xiaomi 13T",
    price: 150,
    quantity: 10,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "ملمس حريري ناعم مضاد للبصمات مع حماية دقيقة لعدسات الكاميرا وتصميم خفيف الوزن.",
    sku: "CAS-MI13-01",
    svgKey: "case_silicone",
    imageUrl: ""
  },
  {
    id: "prod-6",
    storeId: "store-1",
    name: "اسكرين زجاج 9H",
    category: "اسكرينات",
    phoneModel: "iPhone 15 Pro",
    price: 95,
    quantity: 20,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "زجاج ياباني مقسى بدرجة صلابة 9H وحواف منحنية 2.5D مع طبقة طاردة للزيوت والبصمات.",
    sku: "SCR-IP15-01",
    svgKey: "screen_9h",
    imageUrl: ""
  },
  {
    id: "prod-7",
    storeId: "store-1",
    name: "اسكرين خصوصية",
    category: "اسكرينات",
    phoneModel: "Samsung S24 Ultra",
    price: 140,
    quantity: 6,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "حماية تامة من التطفل بزاوية رؤية 28 درجة تحجب الرؤية عن المحيطين مع وضوح فائق للشاشة.",
    sku: "SCR-S24-01",
    svgKey: "screen_privacy",
    imageUrl: ""
  },
  {
    id: "prod-8",
    storeId: "store-1",
    name: "اسكرين نانو مرن",
    category: "اسكرينات",
    phoneModel: "Xiaomi 13T",
    price: 75,
    quantity: 0, // Out of stock
    isAvailable: false,
    isHidden: false,
    hideReason: "",
    description: "فيلم نانو سيراميك مرن غير قابل للكسر يعالج الخدوش البسيطة ذاتياً ويوفر استجابة لمس فورية.",
    sku: "SCR-MI13-01",
    svgKey: "screen_nano",
    imageUrl: ""
  },
  {
    id: "prod-9",
    storeId: "store-2",
    name: "شاحن سريع 33 واط",
    category: "شواحن",
    phoneModel: "Xiaomi 13T",
    price: 390,
    quantity: 9,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "رأس شاحن جداري فائق السرعة يدعم تقنية Quick Charge 4.0 و Power Delivery مع حماية حرارية.",
    sku: "CHG-MI33-01",
    svgKey: "charger_fast",
    imageUrl: ""
  },
  {
    id: "prod-10",
    storeId: "store-2",
    name: "شاحن لاسلكي MagSafe",
    category: "شواحن",
    phoneModel: "iPhone 15 Pro",
    price: 650,
    quantity: 4, // Limited stock (4)
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "قاعدة شحن لاسلكي مغناطيسية بقوة 15 واط مع كابل USB-C مدمج وتصميم ألومنيوم نحيف وفائق الأناقة.",
    sku: "CHG-MAG-01",
    svgKey: "charger_magsafe",
    imageUrl: ""
  },
  {
    id: "prod-11",
    storeId: "store-2",
    name: "شاحن سيارة مزدوج",
    category: "شواحن",
    phoneModel: "الكل",
    price: 220,
    quantity: 14,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "شاحن ولاعة سيارة بقوة 45 واط بمنفذين USB-C و USB-A يدعم الشحن السريع لهاتفين في وقت واحد.",
    sku: "CHG-CAR-01",
    svgKey: "charger_car",
    imageUrl: ""
  },
  {
    id: "prod-12",
    storeId: "store-2",
    name: "كابل Type-C مقوى",
    category: "كابلات",
    phoneModel: "Samsung S24 Ultra",
    price: 110,
    quantity: 25,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "كابل نايلون مجدول عالي المتانة بطول 1.2 متر يدعم الشحن السريع حتى 60 واط ونقل بيانات سريع.",
    sku: "CBL-TC-01",
    svgKey: "cable_typec",
    imageUrl: ""
  },
  {
    id: "prod-13",
    storeId: "store-2",
    name: "كابل Lightning 1م",
    category: "كابلات",
    phoneModel: "iPhone 15 Pro",
    price: 130,
    quantity: 18,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "كابل شحن ومزامنة أصلي معتمد لأجهزة آبل بطول 1 متر مع أطراف مدعمة ضد القطع والانثناء.",
    sku: "CBL-LT-01",
    svgKey: "cable_lightning",
    imageUrl: ""
  },
  // Extra product in pending store to demo approval effect
  {
    id: "prod-14",
    storeId: "store-3",
    name: "جراب أنيق مغناطيسي بلوري",
    category: "جرابات",
    phoneModel: "iPhone 15 Pro",
    price: 350,
    quantity: 10,
    isAvailable: true,
    isHidden: false,
    hideReason: "",
    description: "جراب من متجر ستايل كيس بانتظار اعتماد المتجر من الإدارة.",
    sku: "CAS-STY-01",
    svgKey: "case_clear",
    imageUrl: ""
  }
];

// Seed Users
const SEED_USERS = [
  { username: "user", password: "user", role: "customer", fullName: "أحمد محمد" },
  { username: "Store Owner", password: "Store Owner", role: "store_owner", fullName: "محمود التاجر", storeId: "store-1" },
  { username: "admin", password: "admin", role: "admin", fullName: "مدير النظام" }
];

// Storage Keys
const STORAGE_KEYS = {
  STORES: "dalily_stores_v1",
  PRODUCTS: "dalily_products_v1",
  USERS: "dalily_users_v1",
  CART: "dalily_cart_v1",
  SESSION: "dalily_session_v1"
};

// Utilities for formatting
function formatArabicNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "٠";
  return Number(num).toLocaleString("ar-EG");
}

function formatPrice(num) {
  return `${formatArabicNumber(num)} ج.م`;
}

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

// LocalStorage helpers
function getStores() {
  const data = localStorage.getItem(STORAGE_KEYS.STORES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(SEED_STORES));
    return SEED_STORES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_STORES;
  }
}

function saveStores(stores) {
  localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
}

function getProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCart() {
  const data = localStorage.getItem(STORAGE_KEYS.CART);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function getSession() {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

// Reset Demo Data
function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(SEED_STORES));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  // Keep session if exists or refresh
  window.location.reload();
}

// Sample CSV file generator for Bulk Import
function downloadSampleCSV() {
  const csvContent = "\uFEFF" + 
    "الاسم,السعر,التصنيف,موديل الهاتف,الكمية,الوصف,SKU\n" +
    "جراب حماية شفاف سيليكون,160,جرابات,iPhone 15 Pro,20,جراب ممتاز بحواف هوائية ممتصة للصدمات,CAS-IP15-NEW\n" +
    "اسكرين حماية مطفي مانع للبصمات,110,اسكرينات,Samsung S24 Ultra,15,اسكرين مطفي ممتاز للألعاب والاستخدام الشمسي,SCR-S24-MATTE\n" +
    "شاحن سريع GaN بقدرة 65 واط,540,شواحن,الكل,8,شاحن تقنية نيتريد الغاليوم صغير الحجم وفائق السرعة,CHG-GAN-65W\n" +
    "كابل شحن سريع Type-C إلى Type-C,140,كابلات,Xiaomi 13T,30,كابل فائق المرونة بطول مترين ويدعم 100 واط,CBL-CC-100W\n";

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "dalily_products_sample.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Get Image markup (either custom uploaded image data URL or SVG graphic)
function getProductImageMarkup(product) {
  if (product.imageUrl && product.imageUrl.startsWith("data:")) {
    return `<img src="${escapeHTML(product.imageUrl)}" alt="${escapeHTML(product.name)}" class="product-card-img" />`;
  }
  if (product.svgKey && PRODUCT_SVGS[product.svgKey]) {
    return PRODUCT_SVGS[product.svgKey];
  }
  // Fallback by category
  if (product.category === "جرابات") return PRODUCT_SVGS.case_silicone;
  if (product.category === "اسكرينات") return PRODUCT_SVGS.screen_9h;
  if (product.category === "شواحن") return PRODUCT_SVGS.charger_fast;
  if (product.category === "كابلات") return PRODUCT_SVGS.cable_typec;
  return PRODUCT_SVGS.default_placeholder;
}
