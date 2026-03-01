# Specification

## Summary
**Goal:** Improve the Razorpay checkout experience by tailoring payment method presentation and modal styling for desktop and mobile users.

**Planned changes:**
- Add a device detection utility that identifies mobile vs. desktop based on user agent and/or screen width, exported for use across checkout flows.
- Update Razorpay checkout configuration in `useRazorpay.ts`, `ProductCard.tsx`, `Cart.tsx`, and `ProductDetail.tsx` to show Cards → Net Banking → UPI QR code (no UPI collect/intent) on desktop, and preserve the existing UPI app intent + cards + wallets flow on mobile.
- Ensure the Razorpay modal is properly sized and centered on desktop, and displays correctly (full-screen/bottom-sheet style) on mobile without layout issues.

**User-visible outcome:** Desktop users see a UPI QR code alongside cards and net banking in the Razorpay modal, while mobile users continue to get direct UPI app options. The modal displays cleanly on both device types with no clipped or overflowing elements.
