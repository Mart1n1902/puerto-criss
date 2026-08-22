/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#0e7490',
        accent: '#f97316',
        turquoise: '#06b6d4',
      },
    },
  },
  plugins: [],
};
