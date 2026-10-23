/**
 * Dalily (دليلى) - Store Owner Dashboard Module
 * Handles store profile, statistics, manual product creation, bulk CSV/XLSX import with SheetJS,
 * and product management (edit, delete, live stock toggle).
 */

const StoreModule = (function () {
  let parsedBulkProducts = []; // Temporarily hold parsed rows for bulk import
  let editingProductId = null;
  let tableSearchQuery = "";

  function init() {
    bindEvents();
    refreshDashboard();
  }

  function getActiveStore() {
    const user = AuthModule.getCurrentUser();
    const stores = getStores();
    if (!user) return stores[0]; // fallback to demo store

    let store = stores.find(s => s.owner === user.username);
    if (!store) {
      // Find default store for "Store Owner"
      store = stores[0];
    }
    return store;
  }

  function refreshDashboard() {
    const store = getActiveStore();
    renderStats(store);
    renderStoreProfile(store);
    renderProductsTable();
  }

  function bindEvents() {
    // Store Profile Form Submit
    const profileForm = document.getElementById("storeProfileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", handleProfileSave);
    }

    // Store Logo Upload Preview
    const logoInput = document.getElementById("storeLogoInput");
    if (logoInput) {
      logoInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            const preview = document.getElementById("storeLogoPreview");
            if (preview) {
              preview.innerHTML = `<img src="${evt.target.result}" alt="شعار المحل" style="width:100%;height:100%;object-fit:cover;">`;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Manual Product Form Submit
    const productForm = document.getElementById("manualProductForm");
    if (productForm) {
      productForm.addEventListener("submit", handleProductSave);
    }

    // Product Image Upload Preview
    const prodImgInput = document.getElementById("prodImageInput");
    if (prodImgInput) {
      prodImgInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            const preview = document.getElementById("prodImagePreview");
            if (preview) {
              preview.innerHTML = `<img src="${evt.target.result}" alt="معاينة الصورة" style="width:100%;height:100%;object-fit:cover;">`;
              preview.setAttribute("data-img-url", evt.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Bulk File Input Change (.csv / .xlsx)
    const bulkFileInput = document.getElementById("bulkFileInput");
    if (bulkFileInput) {
      bulkFileInput.addEventListener("change", handleBulkFileSelected);
    }

    // Download Sample CSV button
    const sampleCsvBtn = document.getElementById("btnDownloadSampleCsv");
    if (sampleCsvBtn) {
      sampleCsvBtn.addEventListener("click", downloadSampleCSV);
    }

    // Import Selected Bulk Products button
    const btnImportBulk = document.getElementById("btnImportBulk");
    if (btnImportBulk) {
      btnImportBulk.addEventListener("click", handleBulkImportConfirmed);
    }

    // Bulk Select All Checkbox
    const bulkSelectAll = document.getElementById("bulkSelectAll");
    if (bulkSelectAll) {
      bulkSelectAll.addEventListener("change", function () {
        const isChecked = this.checked;
        document.querySelectorAll(".bulk-row-check:not(:disabled)").forEach(cb => {
          cb.checked = isChecked;
        });
        updateBulkImportBtnState();
      });
    }

    // Table Search
    const searchInput = document.getElementById("storeProductSearch");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        tableSearchQuery = e.target.value.trim().toLowerCase();
        renderProductsTable();
      });
    }

    // Edit Product Modal events
    const editForm = document.getElementById("editProductForm");
    if (editForm) {
      editForm.addEventListener("submit", handleEditProductSave);
    }
    const closeEditModalBtn = document.getElementById("closeEditProductModalBtn");
    if (closeEditModalBtn) {
      closeEditModalBtn.addEventListener("click", () => {
        document.getElementById("editProductModal").classList.remove("active");
      });
    }

    // Delete Confirmation Modal
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", executeProductDelete);
    }
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener("click", () => {
        document.getElementById("deleteConfirmModal").classList.remove("active");
      });
    }
  }

  // 1. Statistics
  function renderStats(store) {
    const products = getProducts().filter(p => p.storeId === store.id);
    const totalItems = products.length;

    // Categories set
    const categories = new Set(products.map(p => p.category));
    const totalCategories = categories.size;

    const totalSales = store.totalSales || 0;

    const statItemsEl = document.getElementById("statTotalItems");
    const statCatsEl = document.getElementById("statTotalCategories");
    const statSalesEl = document.getElementById("statTotalSales");

    if (statItemsEl) statItemsEl.textContent = formatArabicNumber(totalItems);
    if (statCatsEl) statCatsEl.textContent = formatArabicNumber(totalCategories);
    if (statSalesEl) statSalesEl.textContent = formatPrice(totalSales);
  }

  // 2. Store Profile Form & Status Badge
  function renderStoreProfile(store) {
    if (!store) return;

    document.getElementById("storeNameInput").value = store.name || "";
    document.getElementById("storeAreaInput").value = store.area || "";
    document.getElementById("storePhoneInput").value = store.phone || "";
    document.getElementById("storeDescInput").value = store.description || "";

    // Badge
    const statusContainer = document.getElementById("storeStatusBadgeContainer");
    if (statusContainer) {
      let badgeClass = "badge-pending";
      let statusText = "قيد المراجعة";

      if (store.status === "approved") {
        badgeClass = "badge-approved";
        statusText = "معتمد من الإدارة";
      } else if (store.status === "rejected") {
        badgeClass = "badge-rejected";
        statusText = "مرفوض";
      }

      statusContainer.innerHTML = `<span class="badge ${badgeClass}" style="font-size:0.95rem; padding:6px 14px;">${statusText}</span>`;
    }

    // Current store name indicator in header
    const nameInd = document.getElementById("storeOwnerHeaderName");
    if (nameInd) {
      nameInd.textContent = store.name || "محلي";
    }
  }

  function handleProfileSave(e) {
    e.preventDefault();
    const store = getActiveStore();
    const stores = getStores();
    const targetStore = stores.find(s => s.id === store.id);

    if (!targetStore) return;

    targetStore.name = document.getElementById("storeNameInput").value.trim();
    targetStore.area = document.getElementById("storeAreaInput").value.trim();
    targetStore.phone = document.getElementById("storePhoneInput").value.trim();
    targetStore.description = document.getElementById("storeDescInput").value.trim();

    // Check logo upload
    const preview = document.getElementById("storeLogoPreview");
    const imgEl = preview ? preview.querySelector("img") : null;
    if (imgEl) {
      targetStore.logo = imgEl.src;
    }

    // Submitting registers the store with status "قيد المراجعة" (pending) until admin approves it
    // If it was rejected or pending, keep/set pending; if already approved, keep or set pending if updated
    targetStore.status = "pending";

    saveStores(stores);
    showToast("تم حفظ بيانات المحل بنجاح! المتجر الآن قيد مراجعة الإدارة.", "success");
    refreshDashboard();
  }

  // 3. Manual Product Form
  function handleProductSave(e) {
    e.preventDefault();

    const name = document.getElementById("prodNameInput").value.trim();
    const sku = document.getElementById("prodSkuInput").value.trim();
    const price = parseFloat(document.getElementById("prodPriceInput").value);
    const category = document.getElementById("prodCategorySelect").value;
    const phoneModel = document.getElementById("prodModelSelect").value;
    const quantity = parseInt(document.getElementById("prodQuantityInput").value, 10);
    const description = document.getElementById("prodDescInput").value.trim();
    const isAvailable = document.getElementById("prodStockToggle").checked;

    const errorEl = document.getElementById("prodFormError");
    if (!name || isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
      if (errorEl) {
        errorEl.textContent = "يرجى التأكد من ملء جميع الحقول المطلوبة وقيم السعر والكمية الصحيحة.";
        errorEl.style.display = "block";
      }
      return;
    }

    if (errorEl) errorEl.style.display = "none";

    // Image preview URL
    const preview = document.getElementById("prodImagePreview");
    const customImg = preview ? preview.getAttribute("data-img-url") || "" : "";

    const store = getActiveStore();
    const products = getProducts();

    const newProduct = {
      id: "prod-" + Date.now(),
      storeId: store.id,
      name: name,
      category: category,
      phoneModel: phoneModel,
      price: price,
      quantity: quantity,
      isAvailable: isAvailable && quantity > 0,
      isHidden: false,
      hideReason: "",
      description: description,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      svgKey: "",
      imageUrl: customImg
    };

    products.push(newProduct);
    saveProducts(products);

    // Reset Form
    document.getElementById("manualProductForm").reset();
    if (preview) {
      preview.innerHTML = `<span>صورة</span>`;
      preview.removeAttribute("data-img-url");
    }

    showToast("تمت إضافة المنتج بنجاح إلى مخزون محلك!", "success");
    refreshDashboard();
  }

  // 4. Bulk Upload (CSV and XLSX via SheetJS)
  function handleBulkFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      // Use SheetJS
      reader.onload = function (evt) {
        try {
          const data = new Uint8Array(evt.target.result);
          if (typeof XLSX === "undefined") {
            showToast("مكتبة قراءة ملفات الإكسيل غير محملة حالياً، يرجى استخدام ملف CSV.", "error");
            return;
          }
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          processBulkRows(jsonRows);
        } catch (err) {
          showToast("حدث خطأ أثناء قراءة ملف الإكسيل. تأكد من صحة التنسيق.", "error");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV reading
      reader.onload = function (evt) {
        try {
          const csvText = evt.target.result;
          const rows = parseCSVText(csvText);
          processBulkRows(rows);
        } catch (err) {
          showToast("حدث خطأ أثناء قراءة ملف CSV.", "error");
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  }

  // Native robust CSV parser
  function parseCSVText(text) {
    // Remove BOM if present
    const cleanText = text.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r\n|\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i];
      // Regex to handle quoted commas
      const matches = currentline.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentline.split(",");
      const obj = {};
      headers.forEach((header, index) => {
        let val = matches[index] ? matches[index].trim() : "";
        val = val.replace(/^["']|["']$/g, "");
        obj[header] = val;
      });
      result.push(obj);
    }
    return result;
  }

  // Validate and display preview table with checkboxes
  function processBulkRows(rawRows) {
    parsedBulkProducts = [];
    const previewContainer = document.getElementById("bulkPreviewContainer");
    const previewTableBody = document.getElementById("bulkPreviewTableBody");

    if (!rawRows || rawRows.length === 0) {
      showToast("الملف فارغ أو لا يحتوي على صفوف بيانات صحيحة.", "error");
      return;
    }

    rawRows.forEach((row, idx) => {
      // Map expected Arabic columns
      // الاسم, السعر, التصنيف, موديل الهاتف, الكمية, الوصف, SKU
      const name = row["الاسم"] || row["name"] || "";
      const priceRaw = row["السعر"] || row["price"] || "";
      const category = row["التصنيف"] || row["category"] || "جرابات";
      const model = row["موديل الهاتف"] || row["موديل"] || row["model"] || "الكل";
      const qtyRaw = row["الكمية"] || row["quantity"] || "";
      const desc = row["الوصف"] || row["description"] || "";
      const sku = row["SKU"] || row["sku"] || `SKU-BULK-${idx + 1}`;

      const price = parseFloat(priceRaw);
      const quantity = parseInt(qtyRaw, 10);

      // Validate
      let isValid = true;
      let errorReason = "";

      if (!name) {
        isValid = false;
        errorReason = "اسم المنتج مفقود";
      } else if (isNaN(price) || price <= 0) {
        isValid = false;
        errorReason = "السعر غير صحيح";
      } else if (isNaN(quantity) || quantity < 0) {
        isValid = false;
        errorReason = "الكمية غير صحيحة";
      }

      parsedBulkProducts.push({
        index: idx,
        name: name,
        price: price || 0,
        category: category,
        phoneModel: model,
        quantity: isNaN(quantity) ? 0 : quantity,
        description: desc,
        sku: sku,
        isValid: isValid,
        errorReason: errorReason
      });
    });

    // Render Preview Table
    if (previewTableBody) {
      previewTableBody.innerHTML = parsedBulkProducts.map(item => `
        <tr class="${item.isValid ? "" : "table-row-invalid"}">
          <td style="text-align: center;">
            <input 
              type="checkbox" 
              class="bulk-row-check" 
              data-index="${item.index}" 
              ${item.isValid ? "checked" : "disabled"} 
              onchange="StoreModule.updateBulkImportBtnState()"
            />
          </td>
          <td><strong>${escapeHTML(item.name || "—")}</strong></td>
          <td>${item.isValid ? formatPrice(item.price) : `<span style="color:var(--danger-red);">${escapeHTML(item.price)}</span>`}</td>
          <td>${escapeHTML(item.category)}</td>
          <td>${escapeHTML(item.phoneModel)}</td>
          <td>${formatArabicNumber(item.quantity)}</td>
          <td><code>${escapeHTML(item.sku)}</code></td>
          <td>
            ${item.isValid 
              ? `<span class="badge badge-in-stock">سليم</span>` 
              : `<span class="badge badge-out-of-stock" title="${escapeHTML(item.errorReason)}">${escapeHTML(item.errorReason)}</span>`
            }
          </td>
        </tr>
      `).join("");
    }

    if (previewContainer) {
      previewContainer.style.display = "block";
    }

    updateBulkImportBtnState();
    showToast(`تم فحص ${formatArabicNumber(parsedBulkProducts.length)} صف من الملف بنجاح.`, "success");
  }

  function updateBulkImportBtnState() {
    const checkedBoxes = document.querySelectorAll(".bulk-row-check:checked");
    const btn = document.getElementById("btnImportBulk");
    if (btn) {
      btn.disabled = checkedBoxes.length === 0;
      btn.textContent = `استيراد المنتجات المحددة (${formatArabicNumber(checkedBoxes.length)})`;
    }
  }

  function handleBulkImportConfirmed() {
    const checkedBoxes = document.querySelectorAll(".bulk-row-check:checked");
    if (checkedBoxes.length === 0) return;

    const store = getActiveStore();
    const products = getProducts();
    let importedCount = 0;

    checkedBoxes.forEach(cb => {
      const idx = parseInt(cb.getAttribute("data-index"), 10);
      const item = parsedBulkProducts[idx];
      if (item && item.isValid) {
        products.push({
          id: "prod-" + Date.now() + "-" + idx,
          storeId: store.id,
          name: item.name,
          category: item.category,
          phoneModel: item.phoneModel,
          price: item.price,
          quantity: item.quantity,
          isAvailable: item.quantity > 0,
          isHidden: false,
          hideReason: "",
          description: item.description,
          sku: item.sku,
          svgKey: "",
          imageUrl: ""
        });
        importedCount++;
      }
    });

    saveProducts(products);

    // Reset Bulk Preview
    parsedBulkProducts = [];
    document.getElementById("bulkFileInput").value = "";
    document.getElementById("bulkPreviewContainer").style.display = "none";

    showToast(`تم استيراد ${formatArabicNumber(importedCount)} منتج بنجاح إلى متجرك!`, "success");
    refreshDashboard();
  }

  // 5. Product Management Table
  function renderProductsTable() {
    const tableBody = document.getElementById("storeProductsTableBody");
    if (!tableBody) return;

    const store = getActiveStore();
    let products = getProducts().filter(p => p.storeId === store.id);

    if (tableSearchQuery) {
      products = products.filter(p => 
        (p.name || "").toLowerCase().includes(tableSearchQuery) ||
        (p.sku || "").toLowerCase().includes(tableSearchQuery) ||
        (p.category || "").toLowerCase().includes(tableSearchQuery) ||
        (p.phoneModel || "").toLowerCase().includes(tableSearchQuery)
      );
    }

    if (products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">
            لا توجد منتجات مسجلة في هذا المتجر حتى الآن.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = products.map(p => {
      const imgMarkup = getProductImageMarkup(p);

      // Status badge logic
      let statusBadge = "";
      if (p.isHidden) {
        statusBadge = `<span class="badge badge-hidden" title="${escapeHTML(p.hideReason || "بقرار إداري")}">مخفي بواسطة الإدارة</span>`;
      } else if (!p.isAvailable || Number(p.quantity) <= 0) {
        statusBadge = `<span class="badge badge-out-of-stock">نفد المنتج</span>`;
      } else if (Number(p.quantity) <= 5) {
        statusBadge = `<span class="badge badge-low-stock">كمية محدودة (${formatArabicNumber(p.quantity)})</span>`;
      } else {
        statusBadge = `<span class="badge badge-in-stock">متوفر</span>`;
      }

      return `
        <tr data-id="${p.id}">
          <td>
            <div class="table-thumb">
              ${imgMarkup}
            </div>
          </td>
          <td>
            <strong>${escapeHTML(p.name)}</strong>
            <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHTML(p.phoneModel)} | ${escapeHTML(p.sku)}</div>
          </td>
          <td>${escapeHTML(p.category)}</td>
          <td style="color:var(--green); font-weight:800;">${formatPrice(p.price)}</td>
          <td>${formatArabicNumber(p.quantity)}</td>
          <td>
            <label class="toggle-switch-wrap">
              <input 
                type="checkbox" 
                class="toggle-switch-input" 
                ${p.isAvailable ? "checked" : ""} 
                onchange="StoreModule.toggleProductStock('${p.id}', this.checked)"
              />
              <div class="toggle-switch-track">
                <div class="toggle-switch-thumb"></div>
              </div>
            </label>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" onclick="StoreModule.openEditModal('${p.id}')">تعديل</button>
              <button class="btn btn-danger btn-sm" onclick="StoreModule.promptDeleteProduct('${p.id}')">حذف</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function toggleProductStock(productId, isAvailable) {
    const products = getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    prod.isAvailable = isAvailable;
    saveProducts(products);
    showToast(`تم تحديث حالة توفر "${prod.name}"`, "success");
    renderProductsTable();
  }

  // Edit Product Modal
  function openEditModal(productId) {
    const products = getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    editingProductId = productId;
    document.getElementById("editProdName").value = prod.name;
    document.getElementById("editProdSku").value = prod.sku;
    document.getElementById("editProdPrice").value = prod.price;
    document.getElementById("editProdCategory").value = prod.category;
    document.getElementById("editProdModel").value = prod.phoneModel;
    document.getElementById("editProdQuantity").value = prod.quantity;
    document.getElementById("editProdDesc").value = prod.description || "";
    document.getElementById("editProdStockToggle").checked = prod.isAvailable;

    const modal = document.getElementById("editProductModal");
    if (modal) modal.classList.add("active");
  }

  function handleEditProductSave(e) {
    e.preventDefault();
    if (!editingProductId) return;

    const products = getProducts();
    const prod = products.find(p => p.id === editingProductId);
    if (!prod) return;

    prod.name = document.getElementById("editProdName").value.trim();
    prod.sku = document.getElementById("editProdSku").value.trim();
    prod.price = parseFloat(document.getElementById("editProdPrice").value);
    prod.category = document.getElementById("editProdCategory").value;
    prod.phoneModel = document.getElementById("editProdModel").value;
    prod.quantity = parseInt(document.getElementById("editProdQuantity").value, 10);
    prod.description = document.getElementById("editProdDesc").value.trim();
    prod.isAvailable = document.getElementById("editProdStockToggle").checked;

    saveProducts(products);
    document.getElementById("editProductModal").classList.remove("active");
    showToast("تم تحديث بيانات المنتج بنجاح!", "success");
    refreshDashboard();
  }

  // Delete Product
  let deletingProductId = null;
  function promptDeleteProduct(productId) {
    deletingProductId = productId;
    const modal = document.getElementById("deleteConfirmModal");
    if (modal) modal.classList.add("active");
  }

  function executeProductDelete() {
    if (!deletingProductId) return;

    let products = getProducts();
    products = products.filter(p => p.id !== deletingProductId);
    saveProducts(products);

    // Also remove from cart if present
    let cart = getCart();
    cart = cart.filter(c => c.productId !== deletingProductId);
    saveCart(cart);

    document.getElementById("deleteConfirmModal").classList.remove("active");
    deletingProductId = null;
    showToast("تم حذف المنتج من المخزون بنجاح.", "success");
    refreshDashboard();
  }

  return {
    init,
    refreshDashboard,
    toggleProductStock,
    openEditModal,
    promptDeleteProduct,
    updateBulkImportBtnState
  };
})();
