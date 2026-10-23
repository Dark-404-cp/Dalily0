/**
 * Dalily (دليلى) - Admin Dashboard Module
 * Handles store approvals/rejections, global inventory overview, and moderation (hide/unhide products with reasons).
 */

const AdminModule = (function () {
  let globalStoreFilter = "الكل";
  let globalCategoryFilter = "الكل";
  let globalStatusFilter = "الكل";
  let globalSearchQuery = "";
  let moderatingProductId = null;

  function init() {
    bindEvents();
    refreshDashboard();
  }

  function refreshDashboard() {
    renderStats();
    renderPendingStores();
    renderAllStoresTable();
    populateStoreFilterOptions();
    renderGlobalProductsTable();
  }

  function bindEvents() {
    // Global filters
    const filterStore = document.getElementById("adminFilterStore");
    if (filterStore) {
      filterStore.addEventListener("change", function (e) {
        globalStoreFilter = e.target.value;
        renderGlobalProductsTable();
      });
    }

    const filterCat = document.getElementById("adminFilterCategory");
    if (filterCat) {
      filterCat.addEventListener("change", function (e) {
        globalCategoryFilter = e.target.value;
        renderGlobalProductsTable();
      });
    }

    const filterStatus = document.getElementById("adminFilterStatus");
    if (filterStatus) {
      filterStatus.addEventListener("change", function (e) {
        globalStatusFilter = e.target.value;
        renderGlobalProductsTable();
      });
    }

    const searchInput = document.getElementById("adminGlobalSearch");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        globalSearchQuery = e.target.value.trim().toLowerCase();
        renderGlobalProductsTable();
      });
    }

    // Moderation Reason Modal Submit
    const modForm = document.getElementById("moderationForm");
    if (modForm) {
      modForm.addEventListener("submit", handleConfirmHideProduct);
    }
    const closeModBtn = document.getElementById("closeModerationModalBtn");
    if (closeModBtn) {
      closeModBtn.addEventListener("click", () => {
        document.getElementById("moderationModal").classList.remove("active");
      });
    }
  }

  // Summary Stat Cards
  function renderStats() {
    const stores = getStores();
    const products = getProducts();

    const totalStores = stores.length;
    const pendingStores = stores.filter(s => s.status === "pending").length;
    const totalProducts = products.length;
    const hiddenProducts = products.filter(p => p.isHidden).length;

    const elStores = document.getElementById("adminStatStores");
    const elPending = document.getElementById("adminStatPendingStores");
    const elProducts = document.getElementById("adminStatProducts");
    const elHidden = document.getElementById("adminStatHiddenProducts");

    if (elStores) elStores.textContent = formatArabicNumber(totalStores);
    if (elPending) elPending.textContent = formatArabicNumber(pendingStores);
    if (elProducts) elProducts.textContent = formatArabicNumber(totalProducts);
    if (elHidden) elHidden.textContent = formatArabicNumber(hiddenProducts);
  }

  // 1. Review Pending Stores
  function renderPendingStores() {
    const listContainer = document.getElementById("pendingStoresContainer");
    if (!listContainer) return;

    const stores = getStores();
    const pending = stores.filter(s => s.status === "pending");

    if (pending.length === 0) {
      listContainer.innerHTML = `
        <div style="background-color: #F8FAFC; padding: 24px; border-radius: var(--radius-md); text-align: center; color: var(--text-muted); border: 1px dashed var(--border-color);">
          ✅ لا توجد طلبات محلات جديدة قيد المراجعة حالياً.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = pending.map(store => `
      <div class="stat-card" style="border: 1px solid var(--border-color); gap: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--dark-navy);">${escapeHTML(store.name)}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              📍 المنطقة: ${escapeHTML(store.area || "غير محدد")} | 📞 الهاتف: ${escapeHTML(store.phone || "غير محدد")}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              👤 المالك: ${escapeHTML(store.owner)} | 📅 تاريخ الإنشاء: ${escapeHTML(store.createdAt || "اليوم")}
            </div>
            ${store.description ? `<p style="font-size: 0.88rem; margin-top: 6px; color: #334155;">${escapeHTML(store.description)}</p>` : ""}
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary-orange" style="background-color: var(--green);" onclick="AdminModule.approveStore('${store.id}')">
              ✓ قبول المحل
            </button>
            <button class="btn btn-sm btn-danger" onclick="AdminModule.rejectStore('${store.id}')">
              ✕ رفض
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  function approveStore(storeId) {
    const stores = getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    store.status = "approved";
    saveStores(stores);

    showToast(`تم قبول واعتماد محل "${store.name}" بنجاح! تظهر منتجاته الآن للعملاء.`, "success");
    refreshDashboard();
  }

  function rejectStore(storeId) {
    const stores = getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    store.status = "rejected";
    saveStores(stores);

    showToast(`تم رفض اعتماد محل "${store.name}".`, "error");
    refreshDashboard();
  }

  // 2. Global Stores & Products Management
  function renderAllStoresTable() {
    const tableBody = document.getElementById("adminStoresTableBody");
    if (!tableBody) return;

    const stores = getStores();
    const products = getProducts();

    tableBody.innerHTML = stores.map(store => {
      const storeProducts = products.filter(p => p.storeId === store.id);
      let badgeHtml = "";
      if (store.status === "approved") {
        badgeHtml = `<span class="badge badge-approved">معتمد</span>`;
      } else if (store.status === "pending") {
        badgeHtml = `<span class="badge badge-pending">قيد المراجعة</span>`;
      } else {
        badgeHtml = `<span class="badge badge-rejected">مرفوض</span>`;
      }

      return `
        <tr data-store-id="${store.id}">
          <td><strong>${escapeHTML(store.name)}</strong></td>
          <td>${escapeHTML(store.owner)}</td>
          <td>${escapeHTML(store.area || "—")}</td>
          <td>${badgeHtml}</td>
          <td>${formatArabicNumber(storeProducts.length)} منتجات</td>
          <td>${formatPrice(store.totalSales || 0)}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="AdminModule.toggleStoreDetails('${store.id}')">
              عرض المنتجات
            </button>
          </td>
        </tr>
        <tr id="store-details-${store.id}" style="display: none; background-color: #F8FAFC;">
          <td colspan="7" style="padding: 16px;">
            <h5 style="font-weight: 800; margin-bottom: 8px;">منتجات متجر "${escapeHTML(store.name)}":</h5>
            ${renderStoreMiniProducts(storeProducts)}
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderStoreMiniProducts(productsList) {
    if (!productsList || productsList.length === 0) {
      return `<p style="color:var(--text-muted); font-size:0.85rem;">لا توجد منتجات مسجلة في هذا المتجر.</p>`;
    }
    return `
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${productsList.map(p => `
          <div style="background:#FFF; border:1px solid var(--border-color); border-radius:8px; padding:6px 12px; font-size:0.82rem; display:flex; align-items:center; gap:8px;">
            <span><strong>${escapeHTML(p.name)}</strong> (${formatPrice(p.price)})</span>
            ${p.isHidden ? `<span class="badge badge-hidden" style="font-size:0.75rem;">مخفي</span>` : `<span class="badge badge-in-stock" style="font-size:0.75rem;">معروض</span>`}
          </div>
        `).join("")}
      </div>
    `;
  }

  function toggleStoreDetails(storeId) {
    const row = document.getElementById(`store-details-${storeId}`);
    if (row) {
      row.style.display = row.style.display === "none" ? "table-row" : "none";
    }
  }

  function populateStoreFilterOptions() {
    const select = document.getElementById("adminFilterStore");
    if (!select) return;

    const currentVal = select.value;
    const stores = getStores();
    select.innerHTML = `<option value="الكل">كل المحلات</option>` +
      stores.map(s => `<option value="${s.id}">${escapeHTML(s.name)}</option>`).join("");

    select.value = currentVal;
  }

  // Global Products Table
  function renderGlobalProductsTable() {
    const tableBody = document.getElementById("adminGlobalProductsTableBody");
    if (!tableBody) return;

    const stores = getStores();
    const storesMap = {};
    stores.forEach(s => { storesMap[s.id] = s.name; });

    let products = getProducts();

    // Filters
    if (globalStoreFilter !== "الكل") {
      products = products.filter(p => p.storeId === globalStoreFilter);
    }
    if (globalCategoryFilter !== "الكل") {
      products = products.filter(p => p.category === globalCategoryFilter);
    }
    if (globalStatusFilter === "hidden") {
      products = products.filter(p => p.isHidden);
    } else if (globalStatusFilter === "visible") {
      products = products.filter(p => !p.isHidden);
    }

    if (globalSearchQuery) {
      products = products.filter(p =>
        (p.name || "").toLowerCase().includes(globalSearchQuery) ||
        (p.sku || "").toLowerCase().includes(globalSearchQuery) ||
        (p.phoneModel || "").toLowerCase().includes(globalSearchQuery)
      );
    }

    if (products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">
            لا توجد منتجات مطابقة لخيارات الفلترة المحددة.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = products.map(p => {
      const imgMarkup = getProductImageMarkup(p);
      const storeName = storesMap[p.storeId] || "متجر غير معروف";

      return `
        <tr data-id="${p.id}" class="${p.isHidden ? "table-row-invalid" : ""}">
          <td>
            <div class="table-thumb">
              ${imgMarkup}
            </div>
          </td>
          <td>
            <strong>${escapeHTML(p.name)}</strong>
            <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHTML(p.phoneModel)} | ${escapeHTML(p.sku)}</div>
          </td>
          <td>${escapeHTML(storeName)}</td>
          <td>${escapeHTML(p.category)}</td>
          <td style="color:var(--green); font-weight:800;">${formatPrice(p.price)}</td>
          <td>${formatArabicNumber(p.quantity)}</td>
          <td>
            ${p.isHidden 
              ? `<span class="badge badge-hidden" title="${escapeHTML(p.hideReason || "بقرار إداري")}">مخفي: ${escapeHTML(p.hideReason || "بدون سبب")}</span>` 
              : `<span class="badge badge-in-stock">معروض للعملاء</span>`
            }
          </td>
          <td>
            ${p.isHidden
              ? `<button class="btn btn-outline btn-sm" onclick="AdminModule.unhideProduct('${p.id}')">إلغاء الإخفاء</button>`
              : `<button class="btn btn-danger btn-sm" onclick="AdminModule.promptHideProduct('${p.id}')">إخفاء المنتج</button>`
            }
          </td>
        </tr>
      `;
    }).join("");
  }

  // 3. Moderation Control (Hide / Unhide with Reason)
  function promptHideProduct(productId) {
    moderatingProductId = productId;
    const products = getProducts();
    const prod = products.find(p => p.id === productId);

    document.getElementById("moderationProdName").textContent = prod ? prod.name : "";
    document.getElementById("moderationReasonInput").value = "";

    const modal = document.getElementById("moderationModal");
    if (modal) modal.classList.add("active");
  }

  function handleConfirmHideProduct(e) {
    e.preventDefault();
    if (!moderatingProductId) return;

    const reason = document.getElementById("moderationReasonInput").value.trim() || "مخالف لسياسات المنصة";
    const products = getProducts();
    const prod = products.find(p => p.id === moderatingProductId);

    if (prod) {
      prod.isHidden = true;
      prod.hideReason = reason;
      saveProducts(products);

      // If in cart, remove it
      let cart = getCart();
      cart = cart.filter(c => c.productId !== moderatingProductId);
      saveCart(cart);

      showToast(`تم إخفاء المنتج "${prod.name}" من صفحة العملاء بنجاح.`, "success");
    }

    document.getElementById("moderationModal").classList.remove("active");
    moderatingProductId = null;
    refreshDashboard();
  }

  function unhideProduct(productId) {
    const products = getProducts();
    const prod = products.find(p => p.id === productId);

    if (prod) {
      prod.isHidden = false;
      prod.hideReason = "";
      saveProducts(products);
      showToast(`تم إلغاء إخفاء المنتج "${prod.name}" وأصبح معروضاً مجدداً!`, "success");
    }

    refreshDashboard();
  }

  return {
    init,
    refreshDashboard,
    approveStore,
    rejectStore,
    toggleStoreDetails,
    promptHideProduct,
    unhideProduct
  };
})();
