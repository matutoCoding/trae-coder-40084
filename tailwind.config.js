/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        theater: {
          navy: "#1B2A4A",
          gold: "#D4A843",
          "gold-dark": "#B8912E",
          "gold-light": "#E8C96A",
          cream: "#FAF7F0",
          red: "#8B2E2E",
          "red-light": "#C44040",
          "navy-light": "#2D4270",
          "navy-dark": "#0F1A2E",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Noto Sans SC", "sans-serif"],
      },
      backgroundImage: {
        "curtain-texture": "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px)",
        "spotlight": "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,168,67,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
