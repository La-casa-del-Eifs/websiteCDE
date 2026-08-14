import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4fa",
          100: "#dbe6f3",
          200: "#bcd0e6",
          300: "#8eabd2",
          400: "#5880b5",
          500: "#366098",
          600: "#274d7c",
          700: "#203f64",
          800: "#1b3556",
          900: "#0f2b53",
          950: "#081a34",
        },
        gold: {
          50: "#fef9e7",
          100: "#fcefc1",
          200: "#f9df86",
          300: "#f7cd4b",
          400: "#f7bd1e",
          500: "#e5a30d",
          600: "#c67f08",
          700: "#9e5b0b",
          800: "#824810",
          900: "#6f3c11",
          950: "#411e05",
        },
        ink: { DEFAULT: "#14223a", soft: "#46536a", muted: "#8592a6" },
        sand: "#f4f7fb",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: { soft: "0 4px 24px -8px rgba(15, 43, 83, 0.14)" },
    },
  },
  plugins: [],
};

export default config;
