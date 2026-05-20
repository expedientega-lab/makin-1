import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-exo2)', 'sans-serif'],
        mono: ['var(--font-share-tech)', 'monospace'],
        display: ['var(--font-barlow)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
