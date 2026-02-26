# Specification

## Summary
**Goal:** Fix the FloatingWhatsApp button so it always reflects the current WhatsApp phone number saved in the admin panel, rather than using a stale or hardcoded value.

**Planned changes:**
- Update the `FloatingWhatsApp` component to read the phone number from the site settings query result instead of a hardcoded value.
- Invalidate or refetch the React Query cache for site settings after a successful save in `AdminSettings`, so the updated number is immediately available.
- Add a fallback default number in `FloatingWhatsApp` in case no number is returned from the backend.

**User-visible outcome:** After an admin saves a new WhatsApp number in the admin panel, the FloatingWhatsApp button on the customer-facing site immediately dials the updated number without requiring a page reload.
