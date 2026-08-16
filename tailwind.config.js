/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: "#5B1D6B",
        "purple-dark": "#3E1249",
        ink: "#111114",
        grey: "#F2F2F4",
        tint: "#EDE7F0",
        line: "#E7E7EA",
        muted: "#8A8A92",
        green: "#2E7D4F",
        amber: "#C98A2E",
        red: "#C0392B",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        tajawal: ["var(--font-tajawal)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
