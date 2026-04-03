# AURUM — Premium E-Commerce Website

## Folder Structure
```
/
├── index.html              ← Homepage
├── products.html           ← Product listing page
├── product-detail.html     ← Product detail page
├── css/
│   └── style.css           ← All styles (dark luxury theme)
├── js/
│   └── script.js           ← All JavaScript (cart, filters, etc.)
├── images/                 ← Add your product images here
└── README.md
```

---

## Pages Included
- **Homepage** — Hero, featured products, about brand, testimonials, newsletter, footer
- **Product Listing** — Filter tabs, sort dropdown, product grid, load more
- **Product Detail** — Image gallery, variant selection, qty controls, accordion, related products
- **Cart Panel** — Slide-in cart UI on all pages (frontend only)

---

## Shopify Integration Guide

### Method 1 — Shopify Buy Button (Easiest)
This is for embedding on any website, including the one provided.

1. In Shopify Admin → Sales Channels → Buy Button → Create Buy Button
2. Select product → Customize appearance (match gold/black theme)
3. Copy the embed code
4. In the HTML files, find:
   ```html
   <div class="shopify-buy-btn-placeholder" data-product-id="shopify-product-X">
   ```
5. Replace the inner `<button>` with your Shopify Buy Button `<script>` embed

### Method 2 — Shopify Custom Theme (Full Integration)
Convert these files to a Shopify Liquid theme:

1. Rename `.html` → `.liquid` (e.g., `index.liquid` → `templates/index.liquid`)
2. Replace hardcoded product data with Liquid variables:
   ```liquid
   {{ product.title }}
   {{ product.price | money }}
   {{ product.featured_image | img_url: '800x' }}
   ```
3. Use Shopify's Ajax Cart API for the cart panel
4. Upload via Shopify Admin → Online Store → Themes → Upload theme

### Cart Checkout Button
Find in cart panel HTML:
```html
<div class="shopify-checkout-placeholder" id="shopify-checkout">
```
Replace with:
```html
<a href="/checkout" class="btn btn-primary btn-full">Proceed to Checkout</a>
```
Or use Shopify's storefront API for cart management.

---

## Adding Real Product Images
1. Add images to the `/images/` folder
2. In product cards, replace:
   ```html
   <div class="product-img-placeholder">
     <div class="product-img-icon">...</div>
   </div>
   ```
   With:
   ```html
   <img src="images/your-product.jpg" alt="Product Name" />
   ```

---

## Design Customization
All colors, fonts, and spacing are in CSS variables at the top of `style.css`:
```css
:root {
  --gold:       #c9a84c;   /* Primary accent */
  --black:      #0b0b0b;   /* Background */
  --font-display: 'Cormorant Garamond'; /* Headings */
  --font-body:    'DM Sans';            /* Body text */
}
```
