/* IA#2 JS - Shared data and helpers */
const PRODUCTS = [
  {
    id: 1,
    name: "CSEC Mathematics Past Paper Pack",
    price: 1800,
    category: "Past Papers",
    description: "A downloadable pack with past papers and answers.",
    image: "cape-it.jpg"
  },
  {
    id: 2,
    name: "CAPE IT Past Paper Pack",
    price: 2400,
    category: "Past Papers",
    description: "Exam practice for CAPE Information Technology.",
    image: "cape-it.jpg"
  },
  {
    id: 3,
    name: "SBA Template Bundle",
    price: 1500,
    category: "Templates",
    description: "Editable templates for CSEC and CAPE SBAs.",
    image: "sba-templates.jpg"
  },
  {
    id: 4,
    name: "Study Guide Collection",
    price: 1200,
    category: "Study Guides",
    description: "Quick revision notes for major subjects.",
    image: "study-guides.jpg"
  }
];

const CART_KEY = "pastPaperHubCart";
const USER_KEY = "pastPaperHubUser";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function formatJMD(amount) {
  return `J$${Number(amount).toLocaleString("en-JM", { maximumFractionDigits: 2 })}`;
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

function addToCart(productId) {
  const cart = getCart();
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart.`);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "message success";
  setTimeout(() => {
    toast.className = "message";
    toast.textContent = "";
  }, 2000);
}

/* IA#2 JS - Products page DOM rendering */
function renderProducts() {
  const wrap = document.getElementById("productsGrid");
  if (!wrap) return;

  wrap.innerHTML = PRODUCTS.map(product => `
    <article class="card">
      <img src="${product.image}" alt="${product.name}">
      <div class="card-body">
        <span class="tag">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="meta">${product.description}</p>
        <p class="price">${formatJMD(product.price)}</p>
        <div class="card-actions">
          <button class="btn btn-primary" data-add="${product.id}">Add to Cart</button>
          <button class="btn btn-outline" data-view="${product.id}">View</button>
        </div>
      </div>
    </article>
  `).join("");

  wrap.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
  });

  wrap.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      const product = PRODUCTS.find(p => p.id === Number(button.dataset.view));
      alert(`${product.name}\n\n${product.description}\nPrice: ${formatJMD(product.price)}`);
    });
  });
}

/* IA#2 JS - Cart calculations and dynamic table updates */
function calculateTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal >= 5000 ? subtotal * 0.1 : 0;
  const taxable = subtotal - discount;
  const tax = taxable * 0.15;
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}

function renderCartPage() {
  const body = document.getElementById("cartBody");
  const totalsWrap = document.getElementById("cartTotals");
  if (!body || !totalsWrap) return;

  const cart = getCart();

  if (!cart.length) {
    body.innerHTML = `<tr><td colspan="6">Your cart is currently empty.</td></tr>`;
  } else {
    body.innerHTML = cart.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${formatJMD(item.price)}</td>
        <td>
          <input type="number" min="1" value="${item.qty}" data-qty="${item.id}" aria-label="Quantity for ${item.name}">
        </td>
        <td>${formatJMD(item.price * item.qty)}</td>
        <td>${item.qty > 1 ? "Bulk cart" : "Standard"}</td>
        <td><button class="btn btn-danger" data-remove="${item.id}">Remove</button></td>
      </tr>
    `).join("");

    body.querySelectorAll("[data-qty]").forEach(input => {
      input.addEventListener("change", () => {
        const cart = getCart();
        const item = cart.find(i => i.id === Number(input.dataset.qty));
        item.qty = Math.max(1, Number(input.value) || 1);
        saveCart(cart);
        renderCartPage();
      });
    });

    body.querySelectorAll("[data-remove]").forEach(button => {
      button.addEventListener("click", () => {
        const updated = getCart().filter(item => item.id !== Number(button.dataset.remove));
        saveCart(updated);
        renderCartPage();
      });
    });
  }

  const { subtotal, discount, tax, total } = calculateTotals(cart);
  totalsWrap.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${formatJMD(subtotal)}</strong></div>
    <div class="summary-row"><span>Discount</span><strong>- ${formatJMD(discount)}</strong></div>
    <div class="summary-row"><span>Tax (15%)</span><strong>${formatJMD(tax)}</strong></div>
    <div class="summary-row"><span>Total</span><strong>${formatJMD(total)}</strong></div>
  `;
}

/* IA#2 JS - Checkout summary, button actions, and confirmation modal */
function setupCheckoutPage() {
  const summary = document.getElementById("checkoutSummary");
  if (!summary) return;

  const cart = getCart();
  const { subtotal, discount, tax, total } = calculateTotals(cart);

  summary.innerHTML = `
    <div class="summary-row"><span>Items</span><strong>${cart.reduce((sum, item) => sum + item.qty, 0)}</strong></div>
    <div class="summary-row"><span>Subtotal</span><strong>${formatJMD(subtotal)}</strong></div>
    <div class="summary-row"><span>Discount</span><strong>- ${formatJMD(discount)}</strong></div>
    <div class="summary-row"><span>Tax</span><strong>${formatJMD(tax)}</strong></div>
    <div class="summary-row"><span>Amount Being Paid</span><strong>${formatJMD(total)}</strong></div>
  `;

  const amountField = document.getElementById("amountPaid");
  if (amountField) amountField.value = total.toFixed(2);

  const modal = document.getElementById("confirmModal");
  const openBtn = document.getElementById("checkOutBtn");
  const cancelBtn = document.getElementById("cancelCheckoutBtn");
  const confirmBtn = document.getElementById("confirmCheckoutBtn");
  const clearBtn = document.getElementById("clearAllBtn");
  const closeBtn = document.getElementById("closeBtn");
  const continueShoppingBtn = document.getElementById("continueShoppingBtn");

  openBtn?.addEventListener("click", () => modal?.classList.add("show"));
  cancelBtn?.addEventListener("click", () => modal?.classList.remove("show"));

  confirmBtn?.addEventListener("click", () => {
    localStorage.removeItem(CART_KEY);
    modal?.classList.remove("show");
    updateCartCount();
    showToast("Order confirmed. Thank you for shopping with Past Paper Hub JA!");
    setTimeout(() => window.location.href = "index.html", 1200);
  });

  clearBtn?.addEventListener("click", () => {
    saveCart([]);
    const form = document.getElementById("checkoutForm");
    if (form) form.reset();
    window.location.reload();
  });

  closeBtn?.addEventListener("click", () => {
    window.location.href = "products.html";
  });

  continueShoppingBtn?.addEventListener("click", () => {
    window.location.href = "products.html";
  });
}

/* IA#2 JS - Simple form validation for login and registration */
function setupAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const message = document.getElementById("loginMessage");

      if (!username || !password) {
        message.textContent = "Please enter both username and password.";
        message.className = "message error";
        return;
      }

      message.textContent = `Welcome back, ${username}!`;
      message.className = "message success";
      loginForm.reset();
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const username = document.getElementById("regUsername").value.trim();
      const password = document.getElementById("regPassword").value.trim();
      const dob = document.getElementById("dob").value;
      const message = document.getElementById("registerMessage");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!fullName || !email || !username || !password || !dob) {
        message.textContent = "Please complete every field on the form.";
        message.className = "message error";
        return;
      }

      if (!emailOk) {
        message.textContent = "Please enter a valid email address.";
        message.className = "message error";
        return;
      }

      if (password.length < 6) {
        message.textContent = "Password must be at least 6 characters long.";
        message.className = "message error";
        return;
      }

      localStorage.setItem(USER_KEY, JSON.stringify({ fullName, email, username }));
      message.textContent = `Registration successful. Welcome, ${fullName}!`;
      message.className = "message success";
      registerForm.reset();
    });
  }
}

/* IA#2 JS - Shared initialisation across all pages */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderProducts();
  renderCartPage();
  setupCheckoutPage();
  setupAuthForms();
});
