import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf3",
          100: "#d1fae5",
          500: "#0f766e",
          600: "#0b5f5a",
          700: "#0a4f4b",
        },
        alerta: {
          100: "#fee2e2",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
      boxShadow: {
        card: "0 8px 30px rgba(2, 6, 23, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
