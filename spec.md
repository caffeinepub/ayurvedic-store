# Specification

## Summary
**Goal:** Restore the Nature Glow storefront to Version 32 functionality and permanently preserve the admin Internet Identity principal so it is never lost across future deployments or canister upgrades.

**Planned changes:**
- Store the admin principal in a stable backend variable initialized exactly once; no upgrade or redeployment can overwrite it
- Add a one-time bootstrap/claim function so the deployer can set the admin principal on first deployment; subsequent claims are permanently rejected
- Expose an `isAdmin(principal)` query on the backend that checks against the stored stable admin principal
- Update `AdminAuthGuard` and `AdminLogin` to authenticate exclusively via the backend `isAdmin` check against the Internet Identity principal; remove any logic that could silently reset or reassign admin access
- Restore full storefront: Home page (hero, featured products, benefits, testimonials, About Ayurveda), Shop page (product listings with search and category filters), product detail pages, cart drawer and Cart page with quantity controls, checkout form with shipping details
- Restore Razorpay payment integration with UPI visible as a payment option on both desktop and mobile
- Restore Orders page showing authenticated user's order history, and Payment success/failure pages
- Restore all Admin panel pages: Dashboard (stats and charts), Products (CRUD), Orders (view and update fulfillment), Settings (store name, contact email, announcement banner, Razorpay key, WhatsApp number), and Users (list with detail modal)
- Ensure backend correctly persists products, orders, users, and settings across canister upgrades

**User-visible outcome:** The deployer's Internet Identity permanently retains admin access across all future builds, and the full Nature Glow storefront (product listings, cart, checkout, UPI payment, order history, and admin panel) works exactly as it did in Version 32.
