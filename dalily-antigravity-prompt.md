# Prompt: Build "دليلى" (Dalily) — Local Marketplace & E-commerce Website

> Attach the reference screenshot of the customer page together with this prompt. The customer page must visually match it.

## 1. Role & Goal

Act as an expert frontend web developer and UI/UX designer. Build a complete, fully functional, modern website for a local marketplace and e-commerce platform named **"دليلى" (Dalily)**, focused on **phone accessories** (cases, screen protectors, chargers, cables).

- Stack: **HTML5, CSS3, Vanilla JavaScript only** (no frameworks, no build step, no backend).
- Architecture: a **Single Page Application** in vanilla JS. Preferred structure: `index.html`, `css/style.css`, `js/app.js` (optionally split JS into modules: `auth.js`, `data.js`, `user.js`, `store.js`, `admin.js`). Clean, modular, well-commented code.
- Language & direction: **Arabic, RTL** (`<html lang="ar" dir="rtl">`). All UI text in Arabic. Use a clean Arabic font such as **Cairo** or **IBM Plex Sans Arabic** (Google Fonts) with a fallback stack.
- Fully **responsive** (desktop, tablet, mobile).
- Persist all data (products, stores, cart, session, registered users) in **localStorage**, seeded with demo data on first load, so refreshing the page keeps state. Include a hidden/small "reset demo data" option.

## 2. Design System (apply strictly — do not introduce other brand colors)

| Token | Value | Use |
|---|---|---|
| Primary Orange | `#FF7A00` | Brand logo, primary action buttons ("السلة", "إتمام الطلب", "استيراد المنتجات المحددة"), active category pill, focus states |
| Dark Navy | `#0F1F3D` | Headings and primary text, active tabs, "أضف إلى السلة" buttons, store-name pill in header, seller dashboard secondary accents |
| Green | `#1FA971` | Prices, "متوفر" stock status, totals (e.g. "٤٥ ج.م") |
| Background | `#F6F8FB` | Page background (light blue-gray) |
| Cards | `#FFFFFF` | Clean white cards with soft shadow and large radius (14–18px) |
| Image placeholder | `#FFF0E2` | Light peach background behind product images |

- Add a **subtle warm orange gradient/glow on the right side** of the page background (e.g. `radial-gradient(circle at 100% 0, rgba(255,122,0,.14), transparent 45%)`).
- Status badge colors (only these supporting colors): low-stock = light orange background with orange text; out-of-stock = light red background (`#fde2e2`) with red text (`#d64545`); in-stock = light green background with green text.
- **Logo:** an **orange rounded square containing the Arabic letter "د"** in white, followed by the word "دليلى". Use it everywhere instead of icons (header, login, favicon).
- **No dark mode** (keep the palette fixed).
- Buttons: rounded (10–14px), bold text, hover/active/focus states, disabled state (reduced opacity, `not-allowed` cursor).
- Prices are displayed with **Arabic-Indic digits and the "ج.م" suffix**, e.g. `٣٢٠ ج.م` (use `toLocaleString('ar-EG')`).

## 3. Authentication (JavaScript login simulation)

Single **Login page** (clean centered white card):

- Logo "د دليلى" + short tagline.
- Tabs: **تسجيل الدخول** | **حساب عميل جديد** (customer registration: full name, username, password — saved to localStorage and logs the customer in).
- Username + password inputs, error message area, Enter-key submit.
- Quick helper buttons showing demo credentials; clicking one fills the fields and logs in.

Credentials (exact, case-sensitive):

| Role | Username | Password | Redirects to |
|---|---|---|---|
| Customer | `user` | `user` | Customer Page |
| Store Owner | `Store Owner` | `Store Owner` | Store Owner Dashboard |
| Admin | `admin` | `admin` | Admin Dashboard |

- Validate credentials in JS, store the session, and **show/hide the matching view dynamically** (SPA, no page reload). Wrong credentials → Arabic error message.
- Every view has a **logout** button. Protect views: a user cannot open another role's view without logging in as that role. Restore the session on refresh.

## 4. Customer Page (must match the attached screenshot)

### Header (single white rounded bar, RTL order from right to left)
1. Logo (orange square "د" + "دليلى")
2. Navy pill button with the store/section name: **"الجرابات والإكسسوارات"**
3. Plain bold link **"لوحة التحكم"** (returns to login / role selection)
4. Wide **search input** (rounded) with placeholder `ابحث عن منتج أو موديل أو SKU...` — real-time filtering by product name, phone model, and SKU
5. At the far left: orange **"السلة"** button with a cart icon and a round navy counter badge showing the number of items

### Body: two columns
- **Right sidebar (white rounded card, ~290px):**
  - Heading **"الفئة"** with vertical full-width pill buttons: **الكل، جرابات، اسكرينات، شواحن، كابلات**. The active pill is filled orange with white text; inactive pills are white with a light border.
  - Heading **"توافق الهاتف"** with a dropdown: الكل, iPhone 15 Pro, Samsung S24 Ultra, Xiaomi 13T.
  - Outlined button **"مسح الفلاتر"** that resets category, phone filter, and search.
- **Main area:**
  - Title row: **"المنتجات"** (bold navy, right) and the result count on the left, in Arabic digits (e.g. `١٣ منتج`).
  - **Product grid, 4 columns on desktop** (responsive down to 2 on tablet, 1–2 on mobile). Each product card is white, rounded, with:
    - Image area (peach `#FFF0E2` background, rounded) showing the product image (or a placeholder icon)
    - Product name (bold, navy)
    - Compatible phone model (small gray text, e.g. `iPhone 15 Pro`)
    - A row with the **stock badge** on one side and the **price in green** on the other
    - Full-width navy button **"أضف إلى السلة"** (disabled when out of stock)
  - Stock badge logic: quantity 0 / unavailable → red **"نفد المنتج"**; quantity ≤ 5 → orange **"كمية محدودة (٣)"** (Arabic digit quantity); otherwise → green **"متوفر"**.
  - Empty state message when no products match.
- Only show products that belong to **approved stores** and are **not hidden by the admin**.

### Cart ("السلة") & Checkout
- Clicking the cart button opens a **drawer/modal** listing items with name, quantity controls (+ / −), price, remove button, and the **total in green**.
- Empty cart state message.
- Orange **"إتمام الطلب"** button → opens a **success/summary modal** (order number, item count, total, thank-you message), then clears the cart and adds the total to the store's sales stats.
- Cart persists in localStorage; header counter updates instantly.

## 5. Store Owner Dashboard

Header with logo, title "لوحة صاحب المحل", username, logout. Navy secondary accents, orange primary buttons.

1. **Statistics header cards:** Total Items Displayed (إجمالي المنتجات المعروضة), Total Categories (عدد التصنيفات), Total Sales (إجمالي المبيعات, green, in ج.م).
2. **Store profile setup — "إنشاء بيانات المحل":** store name, area/address, phone, short description, logo upload. Submitting registers the store with status **"قيد المراجعة" (pending)** until the admin approves it. Show the current store status badge (pending / approved / rejected).
3. **Manual product form:** product name, SKU, price, description, category (جرابات / اسكرينات / شواحن / كابلات), compatible phone model, quantity, **image upload with live preview** (FileReader → data URL), and a **stock toggle switch** ("متوفر" / "غير متوفر"). Validation with clear Arabic error messages.
4. **Bulk upload:** a file input accepting **.csv and .xlsx** (use SheetJS `xlsx` library from a CDN for Excel parsing; CSV can be parsed natively). Expected columns: `الاسم, السعر, التصنيف, موديل الهاتف, الكمية, الوصف, SKU`. Show a **preview table with a checkbox per row** (select all supported), validation of invalid rows (highlighted), and the orange button **"استيراد المنتجات المحددة"** to import only the selected rows. Provide a downloadable sample CSV template.
5. **Product management table:** for this store's products only — image thumbnail, name, category, price, quantity, stock toggle, status badge (including "مخفي بواسطة الإدارة" if hidden), **Edit** (modal with prefilled form) and **Delete** (with confirmation) actions. Include a search box in the table.

## 6. Admin Dashboard

Header with logo, title "لوحة المدير", logout. Summary stat cards (stores, pending stores, products, hidden products).

1. **"مراجعة المحلات الجديدة":** list of pending stores (name, area, owner, date) with **Approve (قبول)** and **Reject (رفض)** buttons. Approved stores appear on the customer page; rejected/pending ones do not.
2. **Global stores & products management:** table of all stores with status and product counts; selecting/expanding a store shows all its products. Global product table with search and filters (by store, category, status).
3. **Moderation control — "إخفاء المنتجات المخالفة أو غير الصحيحة":** hide/unhide any product with an optional reason field. Hidden products immediately disappear from the customer page.

## 7. Seed / Demo Data

- 3 stores: **الجرابات والإكسسوارات** (approved, belongs to the demo Store Owner), **عالم الشواحن** (approved), **ستايل كيس** (pending, to demo the approval flow).
- **13 visible products** (so the customer page initially shows "١٣ منتج") across the 4 categories and 3 phone models, with varied prices, e.g.:
  - جراب سيليكون مضاد للصدمات — iPhone 15 Pro — ٢٥٠ ج.م
  - جراب جلد فاخر MagSafe — iPhone 15 Pro — ٤٨٠ ج.م
  - جراب شفاف مقوى — Samsung S24 Ultra — ١٨٠ ج.م — **كمية محدودة (٣)**
  - جراب حماية ثقيلة — Samsung S24 Ultra — ٣٢٠ ج.م
  - جراب سيليكون ناعم — Xiaomi 13T — ١٥٠ ج.م
  - اسكرين زجاج 9H — iPhone 15 Pro; اسكرين خصوصية — Samsung S24 Ultra; اسكرين نانو مرن — Xiaomi 13T (**نفد المنتج**)
  - شاحن سريع 33 واط، شاحن لاسلكي MagSafe، شاحن سيارة مزدوج، كابل Type-C مقوى، كابل Lightning 1م
- Use inline SVG/placeholder images (no external image URLs) so the site works offline.

## 8. Technical Requirements & Quality Bar

- Escape all user-entered text before inserting into the DOM (prevent XSS).
- Accessible: semantic HTML, labels for inputs, visible focus outlines (orange), keyboard-operable modals (Esc to close), sufficient contrast.
- Smooth, subtle transitions on hover/open states; no heavy animations.
- Use CSS variables for all design tokens listed in section 2.
- Responsive: sidebar collapses above the product grid on mobile; tables scroll horizontally inside their own container; header wraps with the search bar moving to its own row.
- No console errors. Comment each module/function briefly in English or Arabic.
- Provide a short `README.md` with how to run (open `index.html`) and the demo credentials.

## 9. Acceptance Checklist

- [ ] Login works for `user`, `Store Owner`, `admin` and shows the correct view; wrong credentials show an error; session survives refresh.
- [ ] Customer page matches the attached screenshot (header, right sidebar filters, 4-column card grid, badges, green prices, navy add-to-cart).
- [ ] Real-time search + category + phone filters + "مسح الفلاتر" work together; result count updates.
- [ ] Cart add/remove/quantity, total, "إتمام الطلب" → success modal, sales stat increases.
- [ ] Store owner can register store, add/edit/delete products, toggle stock, upload image with preview, and bulk-import selected rows from CSV/XLSX.
- [ ] Admin can approve/reject stores, view all stores/products, and hide/unhide products; changes reflect instantly on the customer page.
- [ ] Only the specified colors are used; the logo is the orange "د" square; fully RTL and responsive.
