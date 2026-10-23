/**
 * Dalily (دليلى) - Main Application Controller
 * Coordinates view transitions, role protection, toast notifications,
 * modals, and application lifecycle.
 */

// Toast Notifications System
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

// Global View Switcher with Strict Role Isolation
function switchView(viewId) {
  const currentUser = AuthModule.getCurrentUser();

  // Role Access Guard: Store Owner Dashboard
  if (viewId === "store-view") {
    if (!currentUser) {
      showToast("يرجى تسجيل الدخول كصاحب متجر للوصول إلى لوحة التحكم.", "error");
      AuthModule.selectPortal("store_owner");
      switchView("login-view");
      return;
    }
    if (currentUser.role === "customer") {
      showToast("عذرًا، حسابك كعميل لا يملك صلاحية الوصول إلى لوحة تحكم التجار.", "error");
      switchView("customer-view");
      return;
    }
    if (currentUser.role !== "store_owner" && currentUser.role !== "admin") {
      showToast("لا تملك صلاحية الوصول إلى هذه اللوحة.", "error");
      switchView("customer-view");
      return;
    }
  }

  // Role Access Guard: Admin Dashboard
  if (viewId === "admin-view") {
    if (!currentUser) {
      showToast("يرجى تسجيل الدخول كمدير نظام للوصول إلى لوحة الإدارة.", "error");
      AuthModule.selectPortal("admin");
      switchView("login-view");
      return;
    }
    if (currentUser.role !== "admin") {
      showToast("هذه الصفحة مخصصة لمدير النظام فقط.", "error");
      if (currentUser.role === "customer") {
        switchView("customer-view");
      } else {
        switchView("store-view");
      }
      return;
    }
  }

  // Toggle visible sections
  const views = document.querySelectorAll(".view-section");
  views.forEach(v => {
    v.classList.remove("active-view");
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("active-view");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Trigger module-specific refreshes
  if (viewId === "customer-view") {
    AuthModule.updateCustomerHeaderAuth();
    CustomerModule.renderProducts();
    CustomerModule.updateCartBadge();
  } else if (viewId === "store-view") {
    StoreModule.refreshDashboard();
  } else if (viewId === "admin-view") {
    AdminModule.refreshDashboard();
  }
}

// Close all open modals on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
    const cartOverlay = document.getElementById("cartDrawerOverlay");
    if (cartOverlay) cartOverlay.classList.remove("active");
  }
});

// Close modals when clicking backdrop
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

// Reset Demo Data Handler
function handleResetDemoData() {
  if (confirm("هل أنت متأكد من رغبتك في إعادة ضبط كافة البيانات التجريبية للموقع؟")) {
    resetDemoData();
  }
}

// Application Bootstrap
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Submodules
  AuthModule.init();
  CustomerModule.init();
  StoreModule.init();
  AdminModule.init();

  // Restore existing session or default to customer view
  const user = AuthModule.getCurrentUser();
  if (user) {
    if (user.role === "admin") {
      switchView("admin-view");
    } else if (user.role === "store_owner") {
      switchView("store-view");
    } else {
      switchView("customer-view");
    }
  } else {
    // Default to Customer Page as a visitor
    switchView("customer-view");
  }
});
