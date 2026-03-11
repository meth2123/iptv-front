/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#0f1419",
          900: "#131921",
          800: "#1a2332",
          700: "#232f3e",
          600: "#37475a",
          500: "#00a8e1",
          400: "#00d4ff",
          orange: "#ff9900",
          red: "#e50914",
        },
      },
      fontFamily: {
        sans: ["Amazon Ember", "Source Sans 3", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to top, rgba(15,20,25,0.98) 0%, rgba(15,20,25,0.7) 40%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
