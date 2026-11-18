import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#f3efff", soft: "#c6bddc", muted: "#978eae" },
        brand: { DEFAULT: "#a78bfa", dark: "#8b6be8", light: "#30264a" },
        wash: "#171323",
        line: "#3a3150",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
