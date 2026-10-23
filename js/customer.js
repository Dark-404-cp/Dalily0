/**
 * Dalily (دليلى) - Customer Page & Cart Module
 * Implements real-time filtering (search, category, phone model), 4-column product grid,
 * stock badge rules, cart drawer, and checkout with sales stat update.
 */

const CustomerModule = (function () {
  let activeCategory = "الكل";
  let activePhoneModel = "الكل";
  let searchQuery = "";

  function init() {
    bindEvents();
    renderProducts();
    updateCartBadge();
  }

  function bindEvents() {
    // Search input (real-time filtering by name, phone model, SKU)
    const searchInput = document.getElementById("headerSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        searchQuery = e.target.value.trim().toLowerCase();
        renderProducts();
      });
    }

    // Category pills
    document.querySelectorAll(".category-pill-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".category-pill-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        activeCategory = this.getAttribute("data-category");
        renderProducts();
      });
    });

    // Phone model select
    const phoneSelect = document.getElementById("phoneModelSelect");
    if (phoneSelect) {
      phoneSelect.addEventListener("change", function (e) {
        activePhoneModel = e.target.value;
        renderProducts();
      });
    }

    // Reset filters button
    const resetBtn = document.getElementById("btnResetFilters");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetAllFilters);
    }

    // Cart Drawer Open / Close
    const cartBtn = document.getElementById("headerCartBtn");
    const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
    const closeCartBtn = document.getElementById("closeCartBtn");

    if (cartBtn && cartDrawerOverlay) {
      cartBtn.addEventListener("click", openCart);
    }
    if (closeCartBtn && cartDrawerOverlay) {
      closeCartBtn.addEventListener("click", closeCart);
    }
    if (cartDrawerOverlay) {
      cartDrawerOverlay.addEventListener("click", function (e) {
        if (e.target === cartDrawerOverlay) {
          closeCart();
        }
      });
    }

    // Checkout Button
    const checkoutBtn = document.getElementById("btnCheckout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", handleCheckout);
    }

    // Order Success Modal Close
    const closeOrderSuccessBtn = document.getElementById("closeOrderSuccessBtn");
    const orderSuccessModal = document.getElementById("orderSuccessModal");
    if (closeOrderSuccessBtn && orderSuccessModal) {
      closeOrderSuccessBtn.addEventListener("click", () => {
        orderSuccessModal.classList.remove("active");
      });
    }
  }

  function resetAllFilters() {
    activeCategory = "الكل";
    activePhoneModel = "الكل";
    searchQuery = "";

    const searchInput = document.getElementById("headerSearchInput");
    if (searchInput) searchInput.value = "";

    const phoneSelect = document.getElementById("phoneModelSelect");
    if (phoneSelect) phoneSelect.value = "الكل";

    document.querySelectorAll(".category-pill-btn").forEach(b => {
      if (b.getAttribute("data-category") === "الكل") {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    renderProducts();
  }

  // Filter products by:
  // 1. Store is approved
  // 2. Product is not hidden by admin
  // 3. Category match
  // 4. Phone model match
  // 5. Search query (name, model, or SKU)
  function getFilteredProducts() {
    const stores = getStores();
    const approvedStoreIds = new Set(
      stores.filter(s => s.status === "approved").map(s => s.id)
    );

    const allProducts = getProducts();

    return allProducts.filter(p => {
      // Must belong to approved store
      if (!approvedStoreIds.has(p.storeId)) return false;

      // Must not be hidden by admin
      if (p.isHidden) return false;

      // Category filter
      if (activeCategory !== "الكل" && p.category !== activeCategory) {
        return false;
      }

      // Phone model filter
      if (activePhoneModel !== "الكل") {
        if (p.phoneModel !== "الكل" && p.phoneModel !== activePhoneModel) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const nameMatch = (p.name || "").toLowerCase().includes(searchQuery);
        const modelMatch = (p.phoneModel || "").toLowerCase().includes(searchQuery);
        const skuMatch = (p.sku || "").toLowerCase().includes(searchQuery);
        const descMatch = (p.description || "").toLowerCase().includes(searchQuery);
        if (!nameMatch && !modelMatch && !skuMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }

  function renderProducts() {
    const productsGrid = document.getElementById("customerProductsGrid");
    const countBadge = document.getElementById("productsCountBadge");
    if (!productsGrid) return;

    const filtered = getFilteredProducts();

    // Update count in Arabic digits
    if (countBadge) {
      countBadge.textContent = `${formatArabicNumber(filtered.length)} منتج`;
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">لا توجد منتجات مطابقة للبحث</h3>
          <p class="empty-state-desc">جرب تغيير كلمات البحث أو إعادة ضبط الفلاتر لعرض كافة المنتجات المتاحة.</p>
          <button class="btn btn-outline-orange" onclick="CustomerModule.resetAllFilters()">إعادة ضبط الفلاتر</button>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(p => {
      // Stock badge logic
      let badgeHtml = "";
      let isOutOfStock = false;

      if (!p.isAvailable || Number(p.quantity) <= 0) {
        badgeHtml = `<span class="badge badge-out-of-stock">نفد المنتج</span>`;
        isOutOfStock = true;
      } else if (Number(p.quantity) <= 5) {
        badgeHtml = `<span class="badge badge-low-stock">كمية محدودة (${formatArabicNumber(p.quantity)})</span>`;
      } else {
        badgeHtml = `<span class="badge badge-in-stock">متوفر</span>`;
      }

      const imgMarkup = getProductImageMarkup(p);

      return `
        <div class="product-card" data-id="${p.id}">
          <div class="product-img-wrapper">
            ${imgMarkup}
          </div>
          <div class="product-info">
            <h3 class="product-name" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</h3>
            <span class="product-model">${escapeHTML(p.phoneModel)}</span>
            
            <div class="product-pricing-row">
              <span class="product-price">${formatPrice(p.price)}</span>
              ${badgeHtml}
            </div>

            <button 
              class="btn-add-to-cart" 
              onclick="CustomerModule.addToCart('${p.id}')"
              ${isOutOfStock ? "disabled" : ""}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"/>
              </svg>
              أضف إلى السلة
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Cart Management
  function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    if (!product.isAvailable || Number(product.quantity) <= 0) {
      showToast("عذرًا، هذا المنتج غير متوفر حاليًا في المخزون.", "error");
      return;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= Number(product.quantity)) {
        showToast(`لا يمكنك إضافة المزيد، الكمية المتاحة هي ${formatArabicNumber(product.quantity)} فقط.`, "error");
        return;
      }
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category,
        phoneModel: product.phoneModel,
        storeId: product.storeId,
        svgKey: product.svgKey,
        imageUrl: product.imageUrl,
        quantity: 1
      });
    }

    saveCart(cart);
    updateCartBadge();
    showToast(`تمت إضافة "${product.name}" إلى السلة`, "success");
    openCart();
  }

  function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("headerCartBadge");
    if (badge) {
      badge.textContent = formatArabicNumber(totalCount);
    }
  }

  function openCart() {
    renderCartItems();
    const drawerOverlay = document.getElementById("cartDrawerOverlay");
    if (drawerOverlay) {
      drawerOverlay.classList.add("active");
    }
  }

  function closeCart() {
    const drawerOverlay = document.getElementById("cartDrawerOverlay");
    if (drawerOverlay) {
      drawerOverlay.classList.remove("active");
    }
  }

  function renderCartItems() {
    const cart = getCart();
    const itemsList = document.getElementById("cartItemsList");
    const totalAmount = document.getElementById("cartTotalAmount");
    const checkoutBtn = document.getElementById("btnCheckout");

    if (!itemsList) return;

    if (cart.length === 0) {
      itemsList.innerHTML = `
        <div class="empty-state" style="padding: 40px 10px; background: transparent; box-shadow: none;">
          <div class="empty-state-icon">🛒</div>
          <h4 class="empty-state-title" style="font-size: 1.1rem;">السلة فارغة حالياً</h4>
          <p class="empty-state-desc" style="font-size: 0.85rem;">تصفح إكسسوارات هاتفك المفضلة وأضف ما يعجبك إلى السلة.</p>
        </div>
      `;
      if (totalAmount) totalAmount.textContent = formatPrice(0);
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    let grandTotal = 0;

    itemsList.innerHTML = cart.map(item => {
      const lineTotal = item.price * item.quantity;
      grandTotal += lineTotal;
      const imgMarkup = getProductImageMarkup(item);

      return `
        <div class="cart-item-card" data-id="${item.productId}">
          <div class="cart-item-img">
            ${imgMarkup}
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-name">${escapeHTML(item.name)}</h4>
            <span class="cart-item-sub">${escapeHTML(item.phoneModel)}</span>
            <span class="cart-item-unit-price">${formatPrice(item.price)}</span>
          </div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="CustomerModule.changeQuantity('${item.productId}', 1)">+</button>
              <span class="qty-val">${formatArabicNumber(item.quantity)}</span>
              <button class="qty-btn" onclick="CustomerModule.changeQuantity('${item.productId}', -1)">−</button>
            </div>
            <button class="cart-item-remove-btn" onclick="CustomerModule.removeFromCart('${item.productId}')">حذف</button>
          </div>
        </div>
      `;
    }).join("");

    if (totalAmount) totalAmount.textContent = formatPrice(grandTotal);
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  function changeQuantity(productId, delta) {
    const cart = getCart();
    const itemIndex = cart.findIndex(i => i.productId === productId);
    if (itemIndex === -1) return;

    const products = getProducts();
    const product = products.find(p => p.id === productId);

    const newQty = cart[itemIndex].quantity + delta;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (product && newQty > Number(product.quantity)) {
      showToast(`الكمية المتاحة في المخزون هي ${formatArabicNumber(product.quantity)} فقط.`, "error");
      return;
    }

    cart[itemIndex].quantity = newQty;
    saveCart(cart);
    updateCartBadge();
    renderCartItems();
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.productId !== productId);
    saveCart(cart);
    updateCartBadge();
    renderCartItems();
    showToast("تم حذف المنتج من السلة.", "success");
  }

  // Checkout Handler:
  // opens success/summary modal (order number, item count, total, thank-you message),
  // clears cart and adds total to the store's sales stats!
  function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) return;

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update store sales statistics in stores
    const stores = getStores();
    cart.forEach(item => {
      const store = stores.find(s => s.id === item.storeId);
      if (store) {
        store.totalSales = (store.totalSales || 0) + (item.price * item.quantity);
      }
    });
    saveStores(stores);

    // Also deduct stock from products
    const products = getProducts();
    cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.quantity = Math.max(0, Number(prod.quantity) - item.quantity);
        if (prod.quantity === 0) {
          prod.isAvailable = false;
        }
      }
    });
    saveProducts(products);

    // Generate random Arabic order number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumberStr = `#DAL-${formatArabicNumber(randomNum)}`;

    // Populate order success modal
    document.getElementById("orderReceiptNumber").textContent = orderNumberStr;
    document.getElementById("orderReceiptCount").textContent = `${formatArabicNumber(totalCount)} منتجات`;
    document.getElementById("orderReceiptTotal").textContent = formatPrice(grandTotal);

    // Clear cart
    saveCart([]);
    updateCartBadge();
    closeCart();

    // Re-render customer products to update stock badges if changed
    renderProducts();

    // Show Success Modal
    const orderSuccessModal = document.getElementById("orderSuccessModal");
    if (orderSuccessModal) {
      orderSuccessModal.classList.add("active");
    }
  }

  return {
    init,
    renderProducts,
    resetAllFilters,
    addToCart,
    changeQuantity,
    removeFromCart,
    openCart,
    closeCart
  };
})();
