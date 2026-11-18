import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#172b35", soft: "#43565d", muted: "#64757b" },
        brand: { DEFAULT: "#167c73", dark: "#0e625b", light: "#e6f3f1" },
        wash: "#f3f7f6",
        line: "#dce5e5",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
