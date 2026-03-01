# Specification

## Summary
**Goal:** Add guest checkout with full customer details collection and update the admin orders view to display all customer information inline.

**Planned changes:**
- Extend the backend Order type to include guest customer fields: fullName, email, phone, street, city, postalCode, and orderNotes; update order creation to accept and persist these fields with migration support for existing orders
- Update the checkout page to show a guest-friendly form collecting Full Name, Email, Phone, Street Address, City, Postal Code, and Order Notes (optional), with required-field validation before submission
- Redesign the Admin Orders page to display all customer details (Order ID, date/time, name, email, phone, delivery address, items with quantities and prices, order total, status) inline per order without requiring a modal
- Update the OrderDetailModal to show all new customer fields (fullName, email, phone, street, city, postalCode, orderNotes), hiding orderNotes if empty

**User-visible outcome:** Customers (including guests) can complete checkout by filling in their contact and delivery details without logging in. Admins can view full customer information and order details directly in the orders list without opening a modal.
