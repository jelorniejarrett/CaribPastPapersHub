// List of products available in the store
// Each product has an id, name, price, category, short description, and image
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

// Keys used to store data in localStorage
// One for the shopping cart and one for the registered user
const CART_KEY = "pastPaperHubCart";
const USER_KEY = "pastPaperHubUser";

// Gets the cart from localStorage
// If nothing is saved yet, it just returns an empty array
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Saves the cart back to localStorage
// Also updates the cart count displayed in the navbar
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Formats numbers into Jamaican dollars for display
// Example: 1800 → J$1,800
function formatJMD(amount) {
  return `J$${Number(amount).toLocaleString("en-JM", { maximumFractionDigits: 2 })}`;
}

// Updates the cart count shown on the page
// It loops through all cart items and adds up their quantities
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

// Adds a selected product to the cart
function addToCart(productId) {
  const cart = getCart();

  // Find the product from the PRODUCTS array
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Check if the product is already in the cart
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    // If it exists already, just increase the quantity
    existing.qty += 1;
  } else {
    // Otherwise add it as a new item
    cart.push({ ...product, qty: 1 });
  }

  // Save the updated cart
  saveCart(cart);

  // Show a small message confirming it was added
  showToast(`${product.name} added to cart.`);
}

// Displays a temporary message (toast notification)
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = "message success";

  // Hide the message after 2 seconds
  setTimeout(() => {
    toast.className = "message";
    toast.textContent = "";
  }, 2000);
}

// Displays all products on the products page
function renderProducts() {
  const wrap = document.getElementById("productsGrid");
  if (!wrap) return;

  // Build the HTML for each product card
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

  // Add event listeners to all "Add to Cart" buttons
  wrap.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
  });

  // Add event listeners to "View" buttons to show product info
  wrap.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      const product = PRODUCTS.find(p => p.id === Number(button.dataset.view));
      alert(`${product.name}\n\n${product.description}\nPrice: ${formatJMD(product.price)}`);
    });
  });
}

// Calculates the cart totals (subtotal, discount, tax, final total)
function calculateTotals(cart) {

  // Subtotal = sum of price × quantity
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Apply a 10% discount if subtotal is at least 5000
  const discount = subtotal >= 5000 ? subtotal * 0.1 : 0;

  // Amount after discount
  const taxable = subtotal - discount;

  // Tax calculation (15%)
  const tax = taxable * 0.15;

  // Final total
  const total = taxable + tax;

  return { subtotal, discount, tax, total };
}

// Displays the shopping cart page
function renderCartPage() {
  const body = document.getElementById("cartBody");
  const totalsWrap = document.getElementById("cartTotals");
  if (!body || !totalsWrap) return;

  const cart = getCart();

  // If cart is empty, show a simple message
  if (!cart.length) {
    body.innerHTML = `<tr><td colspan="6">Your cart is currently empty.</td></tr>`;
  } else {

    // Generate table rows for each cart item
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

    // Allow user to change quantity
    body.querySelectorAll("[data-qty]").forEach(input => {
      input.addEventListener("change", () => {
        const cart = getCart();
        const item = cart.find(i => i.id === Number(input.dataset.qty));

        // Prevent quantity going below 1
        item.qty = Math.max(1, Number(input.value) || 1);

        saveCart(cart);
        renderCartPage();
      });
    });

    // Remove item button
    body.querySelectorAll("[data-remove]").forEach(button => {
      button.addEventListener("click", () => {
        const updated = getCart().filter(item => item.id !== Number(button.dataset.remove));
        saveCart(updated);
        renderCartPage();
      });
    });
  }

  // Calculate totals and display them
  const { subtotal, discount, tax, total } = calculateTotals(cart);

  totalsWrap.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${formatJMD(subtotal)}</strong></div>
    <div class="summary-row"><span>Discount</span><strong>- ${formatJMD(discount)}</strong></div>
    <div class="summary-row"><span>Tax (15%)</span><strong>${formatJMD(tax)}</strong></div>
    <div class="summary-row"><span>Total</span><strong>${formatJMD(total)}</strong></div>
  `;
}

// Handles checkout page functionality
function setupCheckoutPage() {
  const summary = document.getElementById("checkoutSummary");
  if (!summary) return;

  const cart = getCart();
  const { subtotal, discount, tax, total } = calculateTotals(cart);

  // Display order summary
  summary.innerHTML = `
    <div class="summary-row"><span>Items</span><strong>${cart.reduce((sum, item) => sum + item.qty, 0)}</strong></div>
    <div class="summary-row"><span>Subtotal</span><strong>${formatJMD(subtotal)}</strong></div>
    <div class="summary-row"><span>Discount</span><strong>- ${formatJMD(discount)}</strong></div>
    <div class="summary-row"><span>Tax</span><strong>${formatJMD(tax)}</strong></div>
    <div class="summary-row"><span>Amount Being Paid</span><strong>${formatJMD(total)}</strong></div>
  `;

  // Autofill amount field
  const amountField = document.getElementById("amountPaid");
  if (amountField) amountField.value = total.toFixed(2);

  // Modal and buttons for checkout
  const modal = document.getElementById("confirmModal");
  const openBtn = document.getElementById("checkOutBtn");
  const cancelBtn = document.getElementById("cancelCheckoutBtn");
  const confirmBtn = document.getElementById("confirmCheckoutBtn");
  const clearBtn = document.getElementById("clearAllBtn");
  const closeBtn = document.getElementById("closeBtn");
  const continueShoppingBtn = document.getElementById("continueShoppingBtn");

  // Open confirmation modal
  openBtn?.addEventListener("click", () => modal?.classList.add("show"));

  // Cancel checkout
  cancelBtn?.addEventListener("click", () => modal?.classList.remove("show"));

  // Confirm order
  confirmBtn?.addEventListener("click", () => {
    localStorage.removeItem(CART_KEY);
    modal?.classList.remove("show");
    updateCartCount();

    showToast("Order confirmed. Thank you for shopping with Past Paper Hub JA!");

    // Redirect back to home page
    setTimeout(() => window.location.href = "index.html", 1200);
  });

  // Clear cart and reset form
  clearBtn?.addEventListener("click", () => {
    saveCart([]);
    const form = document.getElementById("checkoutForm");
    if (form) form.reset();
    window.location.reload();
  });

  // Close checkout
  closeBtn?.addEventListener("click", () => {
    window.location.href = "products.html";
  });

  // Continue shopping
  continueShoppingBtn?.addEventListener("click", () => {
    window.location.href = "products.html";
  });
}

// Handles login and registration forms
function setupAuthForms() {

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // LOGIN FORM
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const message = document.getElementById("loginMessage");

      // Basic validation
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

  // REGISTER FORM
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const username = document.getElementById("regUsername").value.trim();
      const password = document.getElementById("regPassword").value.trim();
      const dob = document.getElementById("dob").value;
      const message = document.getElementById("registerMessage");

      // Simple email validation
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

      // Save basic user info locally
      localStorage.setItem(USER_KEY, JSON.stringify({ fullName, email, username }));

      message.textContent = `Registration successful. Welcome, ${fullName}!`;
      message.className = "message success";
      registerForm.reset();
    });
  }
}

// Run these functions once the page finishes loading
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderProducts();
  renderCartPage();
  setupCheckoutPage();
  setupAuthForms();
});
