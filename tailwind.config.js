/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc1fa",
          400: "#36a2f6",
          500: "#0c87eb",
          600: "#0069c9",
          700: "#0154a3",
          800: "#054786",
          900: "#0a3c6f",
        },
      },
    },
  },
  plugins: [],
};
