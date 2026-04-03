/* ============================================================
   AURUM — Main JavaScript
   Features: Navbar, Cart, Filters, Accordion, Animations
   ============================================================ */

/* ===== CART STATE ===== */
// Cart stored in localStorage for persistence across pages
let cart = JSON.parse(localStorage.getItem('aurum-cart')) || [];

/* ===== SAVE CART ===== */
function saveCart() {
  localStorage.setItem('aurum-cart', JSON.stringify(cart));
}

/* ===== DOM READY ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initCart();
  initAddToCart();
  initScrollReveal();
  initFilterTabs();
  initSortSelect();
  initAccordion();
  initVariants();
  initQuantityControls();
  initGalleryThumbs();
  initLoadMore();
  renderCartUI();
});

/* ===================================================
   NAVBAR — scroll effect
   =================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const updateNavbar = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run on load
}

/* ===================================================
   HAMBURGER MENU
   =================================================== */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ===================================================
   CART — open / close panel
   =================================================== */
function initCart() {
  const cartToggle  = document.getElementById('cartToggle');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartPanel   = document.getElementById('cartPanel');
  if (!cartPanel) return;

  const openCart = () => {
    cartPanel.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    cartPanel.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose)  cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });
}

/* ===================================================
   ADD TO CART
   =================================================== */
function initAddToCart() {
  // Delegate: catch all .add-to-cart buttons (now and future)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    e.preventDefault();

    const id    = btn.dataset.id;
    const name  = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10);

    addToCart({ id, name, price });
  });

  // "Buy Now" button on detail page
  const buyNowBtn = document.getElementById('buyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      // In production: replace with Shopify buy button or checkout link
      showToast('Redirecting to checkout…');
    });
  }
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCartUI();
  bumpCartIcon();
  showToast(`${product.name} added to bag`);

  // Open cart panel
  const cartPanel   = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartPanel) {
    cartPanel.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCartUI();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCartUI();
}

/* ===================================================
   RENDER CART UI
   =================================================== */
function renderCartUI() {
  const cartItemsList = document.getElementById('cartItemsList');
  const cartEmpty     = document.getElementById('cartEmpty');
  const cartFooter    = document.getElementById('cartFooter');
  const cartTotal     = document.getElementById('cartTotal');
  const cartCount     = document.getElementById('cartCount');
  const cartItemCount = document.getElementById('cartItemCount');

  // Count badge
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  if (cartCount)     cartCount.textContent = totalQty;
  if (cartItemCount) cartItemCount.textContent = `(${totalQty})`;

  if (!cartItemsList) return;

  if (cart.length === 0) {
    cartItemsList.innerHTML = '';
    if (cartEmpty)   cartEmpty.style.display = 'flex';
    if (cartFooter)  cartFooter.style.display = 'none';
    return;
  }

  if (cartEmpty)  cartEmpty.style.display = 'none';
  if (cartFooter) cartFooter.style.display = 'flex';

  // Render items
  cartItemsList.innerHTML = cart.map(item => `
    <li class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        <i class="fas fa-gem"></i>
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateQty('${item.id}', +1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove">
        <i class="fas fa-xmark"></i>
      </button>
    </li>
  `).join('');

  // Total
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
}

/* ===================================================
   CART ICON ANIMATION
   =================================================== */
function bumpCartIcon() {
  const count = document.getElementById('cartCount');
  if (!count) return;
  count.classList.remove('bump');
  void count.offsetWidth; // reflow trick
  count.classList.add('bump');
  setTimeout(() => count.classList.remove('bump'), 400);
}

/* ===================================================
   TOAST NOTIFICATION
   =================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ===================================================
   SCROLL REVEAL
   =================================================== */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.product-card, .testimonial-card, .about-content, .about-visual, .newsletter-inner, .section-header'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => observer.observe(el));
}

/* ===================================================
   FILTER TABS (Products page)
   =================================================== */
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(() => card.classList.add('visible'), 10);
        } else {
          card.style.display = 'none';
          card.classList.remove('visible');
        }
      });
    });
  });
}

/* ===================================================
   SORT SELECT (Products page)
   =================================================== */
function initSortSelect() {
  const sortSelect = document.getElementById('sortSelect');
  const grid = document.getElementById('productsGrid');
  if (!sortSelect || !grid) return;

  sortSelect.addEventListener('change', () => {
    const value = sortSelect.value;
    const cards  = [...grid.querySelectorAll('.product-card')];

    cards.sort((a, b) => {
      const pa = parseInt(a.dataset.price || 0);
      const pb = parseInt(b.dataset.price || 0);
      if (value === 'price-asc')  return pa - pb;
      if (value === 'price-desc') return pb - pa;
      return 0;
    });

    cards.forEach(card => grid.appendChild(card));
  });
}

/* ===================================================
   ACCORDION (Product detail page)
   =================================================== */
function initAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  if (!triggers.length) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const key     = trigger.dataset.accordion;
      const content = document.getElementById(`acc-${key}`);
      if (!content) return;

      const isOpen = trigger.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-trigger').forEach(t => {
        t.classList.remove('open');
        const id = t.dataset.accordion;
        const c  = document.getElementById(`acc-${id}`);
        if (c) c.classList.remove('open');
      });

      // Toggle this
      if (!isOpen) {
        trigger.classList.add('open');
        content.classList.add('open');
      }
    });
  });
}

/* ===================================================
   VARIANT SELECTION (Product detail page)
   =================================================== */
function initVariants() {
  // Size buttons
  const sizeBtns     = document.querySelectorAll('.size-btn');
  const selectedSize = document.getElementById('selectedSize');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (selectedSize) selectedSize.textContent = btn.dataset.value;
    });
  });

  // Color buttons
  const colorBtns      = document.querySelectorAll('.color-btn');
  const selectedColor  = document.getElementById('selectedColor');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (selectedColor) selectedColor.textContent = btn.dataset.value;
    });
  });
}

/* ===================================================
   QUANTITY CONTROLS (Product detail page)
   =================================================== */
function initQuantityControls() {
  const minusBtn   = document.getElementById('qtyMinus');
  const plusBtn    = document.getElementById('qtyPlus');
  const qtyDisplay = document.getElementById('qtyDisplay');
  if (!minusBtn || !plusBtn || !qtyDisplay) return;

  let qty = 1;

  minusBtn.addEventListener('click', () => {
    if (qty > 1) {
      qty--;
      qtyDisplay.textContent = qty;
    }
  });

  plusBtn.addEventListener('click', () => {
    qty++;
    qtyDisplay.textContent = qty;
  });

  // Update add-to-cart button to use qty
  const addBtn = document.querySelector('.shopify-detail-placeholder .add-to-cart');
  if (addBtn) {
    minusBtn.addEventListener('click', () => addBtn.dataset.qty = qty);
    plusBtn.addEventListener('click',  () => addBtn.dataset.qty = qty);
  }
}

/* ===================================================
   GALLERY THUMBNAILS (Product detail page)
   =================================================== */
function initGalleryThumbs() {
  const thumbs    = document.querySelectorAll('.gallery-thumb');
  const mainImg   = document.querySelector('.gallery-main-img');
  if (!thumbs.length || !mainImg) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active-thumb'));
      thumb.classList.add('active-thumb');
      // In production: swap mainImg src with thumb src
      // Here we just toggle the style class for demo
      const styleClass = [...thumb.classList].find(c => c.startsWith('style-'));
      mainImg.className = 'gallery-main-img product-img-placeholder active-gallery-img';
      if (styleClass) mainImg.classList.add(styleClass);
    });
  });
}

/* ===================================================
   LOAD MORE BUTTON (Products page — demo)
   =================================================== */
function initLoadMore() {
  const btn = document.getElementById('loadMoreBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.textContent = 'Loading…';
    btn.disabled = true;
    // Simulate async load (replace with real API call in production)
    setTimeout(() => {
      btn.textContent = 'All Products Loaded';
    }, 1200);
  });
}

/* ===================================================
   NEWSLETTER FORM
   =================================================== */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  showToast('Welcome to the inner circle!');
  input.value = '';
}

/* ===================================================
   SMOOTH SCROLL for anchor links
   =================================================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/*
  =====================================================
  SHOPIFY INTEGRATION NOTES
  =====================================================

  1. SHOPIFY BUY BUTTON:
     Find all <div class="shopify-buy-btn-placeholder"> elements.
     Replace their inner HTML with Shopify's Buy Button embed script.
     Example Shopify Buy Button script:
       <div id='product-component-XXXXX'></div>
       <script>
         var client = ShopifyBuy.buildClient({ domain: 'your-store.myshopify.com', storefrontAccessToken: 'xxx' });
         var ui = ShopifyBuy.UI.init(client);
         ui.createComponent('product', { id: 'PRODUCT_ID', node: document.getElementById('product-component-XXXXX'), ... });
       </script>

  2. CART CHECKOUT:
     Find <div class="shopify-checkout-placeholder"> in the cart panel.
     Replace with Shopify cart redirect or checkout button.

  3. PRODUCT DETAIL BUY BUTTON:
     Find <div class="shopify-detail-placeholder" id="shopify-detail-buy-btn">.
     Replace with Shopify Buy Button embed for the specific product.

  4. For full Shopify theme integration, these HTML files can be
     converted to Liquid (.liquid) templates and uploaded as a
     custom Shopify theme.

  =====================================================
*/
