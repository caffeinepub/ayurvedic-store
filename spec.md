# Specification

## Summary
**Goal:** Add a Customer Delivery Details form step before Razorpay payment initiation, store delivery info with each order, and display it in the Admin Orders panel.

**Planned changes:**
- Update the backend `Order` type in `backend/main.mo` to include `fullName`, `address`, and `phoneNumber` fields, with safe defaults for existing orders
- Update the order creation backend function to accept and persist these three delivery fields
- Add a Customer Delivery Details form (Full Name, Delivery Address, Phone Number) that appears before Razorpay is launched, both on the ProductDetail "Buy Now" flow and the Cart checkout flow
- Validate that all three fields are non-empty before allowing payment to proceed
- Pass the collected delivery details along with the order creation call to the backend
- Update the AdminOrders page to show customer name and phone number on each order card
- Update the OrderDetailModal to display Full Name, Delivery Address, and Phone Number in a clearly labeled section, with "Not provided" fallback for older orders

**User-visible outcome:** Customers must fill in their name, delivery address, and phone number before being sent to Razorpay. Admins can see full delivery details for every order in the admin panel.
