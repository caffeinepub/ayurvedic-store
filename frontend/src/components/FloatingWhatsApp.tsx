import { useState, useEffect } from 'react';
import { useWhatsappNumber } from '../hooks/useQueries';
import { SiWhatsapp } from 'react-icons/si';

const FALLBACK_NUMBER = '919819187188';
const PREFILLED_MESSAGE = 'Hello, I would like to know more about your Ayurvedic face packs.';

export default function FloatingWhatsApp() {
  const { data: whatsappNumber, isLoading, isFetched } = useWhatsappNumber();
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Entrance animation: delay slightly then fade in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Determine the number to use:
  // - While loading, use fallback so the button is always available
  // - Once fetched, prefer the backend value; fall back only if empty
  const resolvedNumber =
    isFetched && whatsappNumber && whatsappNumber.trim() !== ''
      ? whatsappNumber.trim()
      : FALLBACK_NUMBER;

  const encodedMessage = encodeURIComponent(PREFILLED_MESSAGE);
  const waUrl = `https://wa.me/${resolvedNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Hide the button if the backend explicitly returned an empty string (admin cleared it)
  // but only after the query has settled — don't hide during loading
  if (isFetched && !isLoading && whatsappNumber === '') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* Tooltip */}
      <div
        className={`transition-all duration-200 ease-out pointer-events-none ${
          showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <div
          className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-botanical"
          style={{
            backgroundColor: 'oklch(0.35 0.09 145)',
            color: 'oklch(0.97 0.012 90)',
          }}
        >
          Chat with us on WhatsApp
          {/* Small arrow pointing down */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid oklch(0.35 0.09 145)',
            }}
          />
        </div>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Chat with us on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 group"
        style={{
          backgroundColor: '#25D366',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 6px 28px rgba(37, 211, 102, 0.55), 0 2px 12px rgba(0, 0, 0, 0.18)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 20px rgba(37, 211, 102, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        <SiWhatsapp className="w-7 h-7 text-white" />

        {/* Subtle pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: '#25D366' }}
        />
      </button>
    </div>
  );
}
