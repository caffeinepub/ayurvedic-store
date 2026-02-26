# Specification

## Summary
**Goal:** Add a floating WhatsApp customer support button to all customer-facing pages of the Nature Glow Ayurvedic site.

**Planned changes:**
- Create a `FloatingWhatsApp` component as a fixed 56×56px (desktop) / 48×48px (mobile) circular button in the bottom-right corner with WhatsApp green (#25D366) background and white WhatsApp icon
- On click, opens `https://wa.me/919819187188?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20your%20Ayurvedic%20face%20packs.` in a new tab
- Add soft box-shadow, hover scale-up (scale-110) with green glow effect, and a tooltip "Chat with us on WhatsApp" styled in earthy/natural tones
- Add entrance animation (fade-in + slide-up) on page load with a 300–500ms delay
- Mount the component in the `CustomerLayout` wrapper so it appears on all customer-facing pages
- Use the WhatsApp number from backend site settings via existing hook, falling back to `919819187188` if empty

**User-visible outcome:** A floating WhatsApp button appears on all customer-facing pages, animates in on load, shows a tooltip on hover, and opens a pre-filled WhatsApp chat when clicked.
