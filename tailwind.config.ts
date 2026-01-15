import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gt-red': '#e00000',
        'gt-black': '#0f0f0f',
        'gt-gray': '#1c1c1c',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
        heading: ['var(--font-rajdhani)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
