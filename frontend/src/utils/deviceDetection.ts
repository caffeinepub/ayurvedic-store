/**
 * Device detection utility for Razorpay checkout configuration.
 * Combines user-agent string analysis with screen width thresholds
 * to reliably distinguish mobile/tablet devices from desktop browsers.
 */

const MOBILE_UA_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Touch/i;

/**
 * Returns true if the current user is on a mobile or tablet device.
 * Uses both user-agent detection and screen width (< 768px) as a fallback.
 */
export function isMobileDevice(): boolean {
  // Primary: user-agent based detection
  if (typeof navigator !== 'undefined' && MOBILE_UA_PATTERN.test(navigator.userAgent)) {
    return true;
  }
  // Secondary: screen width threshold (phones/tablets are typically < 768px)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return true;
  }
  return false;
}
