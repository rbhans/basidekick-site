/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        manrope: ['"Manrope"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#18181B',
          card: '#27272A',
        },
        border: {
          DEFAULT: '#27272A',
          hover: '#3F3F46',
        },
        accent: '#C4F82A',
        txt: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          tertiary: '#71717A',
          muted: '#52525B',
        },
        alert: '#FA541C',
        status: {
          green: '#22C55E',
        },
      },
    },
  },
  plugins: [],
};
