/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        'soft-cloud': '#f5f5f5',
        mute: '#707072',
        hairline: '#cacacb',
        'hairline-soft': '#e5e5e5',
        sale: '#d30005',
        success: '#007d48',
        info: '#1151ff',
      },
    },
  },
  plugins: [],
};
