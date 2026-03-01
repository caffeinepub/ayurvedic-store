# Specification

## Summary
**Goal:** Fix the missing UPI payment option in the Razorpay checkout modal when accessed from a desktop browser.

**Planned changes:**
- Update the device-aware payment method configuration in `frontend/src/hooks/useRazorpay.ts` to include UPI for desktop devices, ensuring it appears alongside all other payment methods (cards, net banking, wallets) on both desktop and mobile.

**User-visible outcome:** Users on desktop browsers will now see UPI as a payment option in the Razorpay checkout modal, matching the mobile experience.
