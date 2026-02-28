/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // ── Ayurvedic brand palette ──
        forest:     'oklch(0.28 0.08 148)',   // deep forest green
        sage:       'oklch(0.62 0.07 148)',   // light sage green
        golden:     'oklch(0.70 0.13 72)',    // soft gold
        bark:       'oklch(0.40 0.06 55)',    // earthy brown
        cream:      'oklch(0.97 0.012 85)',   // warm beige/cream
        parchment:  'oklch(0.93 0.025 85)',   // slightly deeper cream
        terracotta: 'oklch(0.56 0.14 38)',    // warm terracotta accent

        // Admin-specific tokens
        admin: {
          bg:      'var(--admin-bg)',
          sidebar: 'var(--admin-sidebar)',
          card:    'var(--admin-card)',
          fg:      'var(--admin-fg)',
          muted:   'var(--admin-muted)',
          border:  'var(--admin-border)',
          hover:   'var(--admin-hover)',
          accent:  'var(--admin-accent)',
        },
      },
      fontFamily: {
        sans:  ['Lato', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'botanical':    '0 2px 16px oklch(0.28 0.08 148 / 0.10), 0 1px 4px oklch(0.28 0.08 148 / 0.06)',
        'botanical-lg': '0 8px 32px oklch(0.28 0.08 148 / 0.15), 0 2px 8px oklch(0.28 0.08 148 / 0.08)',
        'herb':         '0 2px 12px oklch(0.42 0.09 145 / 0.12)',
        'herb-lg':      '0 8px 32px oklch(0.42 0.09 145 / 0.15)',
        'golden':       '0 4px 24px oklch(0.70 0.13 72 / 0.25), 0 1px 6px oklch(0.70 0.13 72 / 0.12)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        // Ken Burns: slow cinematic pan from left + gentle zoom
        'kenBurnsEffect': {
          '0%': {
            transform: 'translateX(-5%) scale(1.0)',
          },
          '100%': {
            transform: 'translateX(0%) scale(1.12)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'kenburns': 'kenBurnsEffect 20s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
