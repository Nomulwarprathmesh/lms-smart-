import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14202B',
        paper: '#F3F5F7',
        line: '#D8DEE4',
        brand: '#0F6B7A',
        'brand-dark': '#0A4F5B',
      },
    },
  },
  plugins: [],
};
export default config;
