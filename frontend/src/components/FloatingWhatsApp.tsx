import { useState, useEffect } from 'react';
import { useWhatsappNumber } from '../hooks/useQueries';
import { SiWhatsapp } from 'react-icons/si';

const FALLBACK_NUMBER = '919819187188';
const PREFILLED_MESSAGE = 'Hello! I would like to know more about your Ayurvedic skincare products. 🌿';

export default function FloatingWhatsApp() {
  const { data: whatsappNumber, isLoading, isFetched } = useWhatsappNumber();
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Entrance animation: delay slightly then slide up
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
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

  // Hide the button only if the backend explicitly returned an empty string (admin cleared it)
  // but only after the query has settled — don't hide during loading
  if (isFetched && !isLoading && whatsappNumber === '') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Tooltip */}
      <div
        className={`transition-all duration-200 ease-out pointer-events-none ${
          showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <div
          className="relative px-4 py-2 rounded-xl text-sm font-sans font-medium whitespace-nowrap shadow-botanical"
          style={{
            backgroundColor: 'oklch(0.28 0.08 148)',
            color: 'oklch(0.97 0.012 85)',
          }}
        >
          Chat with us on WhatsApp 🌿
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid oklch(0.28 0.08 148)',
            }}
          />
        </div>
      </div>

      {/* WhatsApp Button with pulse ring */}
      <div className="relative">
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: '#25D366' }}
        />
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-15"
          style={{ backgroundColor: '#25D366', animationDelay: '0.5s' }}
        />

        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          aria-label="Chat with us on WhatsApp"
          className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: '#25D366',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.40), 0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <SiWhatsapp className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}
