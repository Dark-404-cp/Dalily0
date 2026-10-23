/**
 * Dalily (دليلى) - Authentication Module
 * Handles independent accounts for:
 * 1. Customer (عميل) - completely isolated, no dashboard link shown!
 * 2. Store Owner (صاحب محل) - dedicated store dashboard
 * 3. Admin (مدير النظام) - dedicated administration & moderation dashboard
 */

const AuthModule = (function () {
  let currentUser = null;
  let activePortal = "customer"; // 'customer' | 'store_owner' | 'admin'

  function init() {
    const savedSession = getSession();
    if (savedSession) {
      currentUser = savedSession;
    } else {
      currentUser = null;
    }

    bindAuthEvents();
    updateCustomerHeaderAuth();
  }

  function getCurrentUser() {
    return currentUser;
  }

  function selectPortal(portalName) {
    activePortal = portalName;

    // Update portal tab buttons
    document.querySelectorAll(".portal-tab-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`portalTab_${portalName}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Update portal panels
    document.querySelectorAll(".portal-panel").forEach(panel => panel.classList.remove("active-portal"));
    const activePanel = document.getElementById(`portalPanel_${portalName}`);
    if (activePanel) activePanel.classList.add("active-portal");

    hideAuthError();
  }

  function bindAuthEvents() {
    // 1. Customer Portal: Login & Register tabs
    const tabCustomerLogin = document.getElementById("tabCustLoginBtn");
    const tabCustomerRegister = document.getElementById("tabCustRegisterBtn");
    const custLoginFields = document.getElementById("custLoginFormFields");
    const custRegisterFields = document.getElementById("custRegisterFormFields");

    if (tabCustomerLogin && tabCustomerRegister) {
      tabCustomerLogin.addEventListener("click", () => {
        tabCustomerLogin.classList.add("active");
        tabCustomerRegister.classList.remove("active");
        custLoginFields.style.display = "block";
        custRegisterFields.style.display = "none";
        hideAuthError();
      });

      tabCustomerRegister.addEventListener("click", () => {
        tabCustomerRegister.classList.add("active");
        tabCustomerLogin.classList.remove("active");
        custLoginFields.style.display = "none";
        custRegisterFields.style.display = "block";
        hideAuthError();
      });
    }

    // Customer Login Submit
    const custLoginForm = document.getElementById("customerLoginForm");
    if (custLoginForm) {
      custLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("custLoginUsername").value.trim();
        const password = document.getElementById("custLoginPassword").value;
        authenticateUser(username, password, "customer");
      });
    }

    // Customer Register Submit
    const custRegForm = document.getElementById("customerRegisterForm");
    if (custRegForm) {
      custRegForm.addEventListener("submit", function (e) {
        e.preventDefault();
        handleCustomerRegister();
      });
    }

    // 2. Store Owner Login Submit
    const storeLoginForm = document.getElementById("storeLoginForm");
    if (storeLoginForm) {
      storeLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("storeLoginUsername").value.trim();
        const password = document.getElementById("storeLoginPassword").value;
        authenticateUser(username, password, "store_owner");
      });
    }

    // 3. Admin Login Submit
    const adminLoginForm = document.getElementById("adminLoginForm");
    if (adminLoginForm) {
      adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("adminLoginUsername").value.trim();
        const password = document.getElementById("adminLoginPassword").value;
        authenticateUser(username, password, "admin");
      });
    }

    // Quick Login Demo Buttons
    const btnQuickCustomer = document.getElementById("btnQuickCustomerLogin");
    if (btnQuickCustomer) {
      btnQuickCustomer.addEventListener("click", () => {
        authenticateUser("user", "user", "customer");
      });
    }

    const btnQuickStore = document.getElementById("btnQuickStoreLogin");
    if (btnQuickStore) {
      btnQuickStore.addEventListener("click", () => {
        authenticateUser("Store Owner", "Store Owner", "store_owner");
      });
    }

    const btnQuickAdmin = document.getElementById("btnQuickAdminLogin");
    if (btnQuickAdmin) {
      btnQuickAdmin.addEventListener("click", () => {
        authenticateUser("admin", "admin", "admin");
      });
    }

    // Logout actions across all pages
    document.querySelectorAll(".btn-logout-action").forEach(btn => {
      btn.addEventListener("click", handleLogout);
    });
  }

  // Unified authentication with strict role matching
  function authenticateUser(username, password, expectedRole) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      showAuthError("بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.");
      return;
    }

    // Verify role matches the portal
    if (user.role !== expectedRole) {
      if (expectedRole === "customer") {
        showAuthError("هذا الحساب ليس حساب عميل. يرجى الدخول من البوابة المخصصة لنوع حسابك.");
      } else if (expectedRole === "store_owner") {
        showAuthError("هذا الحساب ليس حساب تاجر / صاحب محل.");
      } else if (expectedRole === "admin") {
        showAuthError("هذا الحساب ليس لديه صلاحيات مدير النظام.");
      }
      return;
    }

    hideAuthError();
    loginUser(user);
  }

  function handleCustomerRegister() {
    const fullName = document.getElementById("custRegFullName").value.trim();
    const username = document.getElementById("custRegUsername").value.trim();
    const password = document.getElementById("custRegPassword").value;

    if (!fullName || !username || !password) {
      showAuthError("يرجى ملء كافة حقول التسجيل المطلوبة.");
      return;
    }

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showAuthError("اسم المستخدم مسجل مسبقاً. يرجى اختيار اسم مستخدم آخر.");
      return;
    }

    const newCustomer = {
      fullName: fullName,
      username: username,
      password: password,
      role: "customer"
    };

    users.push(newCustomer);
    saveUsers(users);

    hideAuthError();
    showToast(`تم إنشاء حسابك يا ${fullName} بنجاح! جاري توجيهك للتسوق...`, "success");
    loginUser(newCustomer);
  }

  function loginUser(user) {
    currentUser = user;
    saveSession(user);

    updateCustomerHeaderAuth();
    showToast(`أهلاً بك، ${user.fullName || user.username}!`, "success");

    if (user.role === "admin") {
      switchView("admin-view");
    } else if (user.role === "store_owner") {
      switchView("store-view");
    } else {
      // Customer role -> redirects directly to customer shopping view
      switchView("customer-view");
    }
  }

  function handleLogout() {
    currentUser = null;
    saveSession(null);
    updateCustomerHeaderAuth();
    showToast("تم تسجيل الخروج بنجاح.", "success");
    switchView("customer-view");
  }

  /**
   * CRITICAL FEATURE:
   * "بدون ما يظهر لوحه التحكم وانا عميل"
   * Update Customer Page Header to NEVER show "لوحة التحكم" when logged in as a Customer!
   */
  function updateCustomerHeaderAuth() {
    const navContainer = document.getElementById("headerAuthNav");
    if (!navContainer) return;

    if (!currentUser) {
      // Guest / Visitor: Show login link
      navContainer.innerHTML = `
        <button type="button" class="header-login-link" onclick="switchView('login-view')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>تسجيل الدخول</span>
        </button>
      `;
    } else if (currentUser.role === "customer") {
      // CUSTOMER LOGGED IN:
      // STRICT RULE: NO DASHBOARD LINK AT ALL!
      // Only show customer name badge and logout button!
      navContainer.innerHTML = `
        <div class="header-user-badge" title="حساب عميل">
          <span>👤 ${escapeHTML(currentUser.fullName || currentUser.username)}</span>
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="AuthModule.handleLogout()" title="تسجيل الخروج">
          خروج
        </button>
      `;
    } else if (currentUser.role === "store_owner") {
      // Store Owner previewing customer page
      navContainer.innerHTML = `
        <div class="header-user-badge">
          <span class="role-tag">صاحب محل</span>
          <span>${escapeHTML(currentUser.username)}</span>
        </div>
        <button type="button" class="header-dash-return-link" onclick="switchView('store-view')">
          لوحة التحكم ←
        </button>
        <button type="button" class="btn btn-outline btn-sm" onclick="AuthModule.handleLogout()">
          خروج
        </button>
      `;
    } else if (currentUser.role === "admin") {
      // Admin previewing customer page
      navContainer.innerHTML = `
        <div class="header-user-badge">
          <span class="role-tag" style="background-color: var(--primary-orange);">المدير</span>
          <span>admin</span>
        </div>
        <button type="button" class="header-dash-return-link" onclick="switchView('admin-view')">
          لوحة المدير ←
        </button>
        <button type="button" class="btn btn-outline btn-sm" onclick="AuthModule.handleLogout()">
          خروج
        </button>
      `;
    }
  }

  function showAuthError(msg) {
    const alertBox = document.getElementById("authErrorAlert");
    if (alertBox) {
      alertBox.textContent = msg;
      alertBox.style.display = "block";
    }
  }

  function hideAuthError() {
    const alertBox = document.getElementById("authErrorAlert");
    if (alertBox) {
      alertBox.style.display = "none";
    }
  }

  return {
    init,
    getCurrentUser,
    selectPortal,
    handleLogout,
    updateCustomerHeaderAuth
  };
})();
