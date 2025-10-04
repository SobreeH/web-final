module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      zIndex: {
        9999: "9999",
      },
    },
  },
  safelist: ["z-9999"],
  plugins: [],
  gridTemplateColumns: {
    auto: "repeat(auto-fill,minmax(200px,1fr))",
  },
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5f6FF",
      },
    },
  },
  plugins: [],
};
