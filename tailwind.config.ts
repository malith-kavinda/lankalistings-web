import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        surface: "#f7f9fb",
        "surface-lowest": "#ffffff",
        "surface-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-high": "#e6e8ea",
        "surface-highest": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#45464d",
        outline: "#76777d",
        "outline-variant": "#c6c6cd",
        navy: "#131b2e",
        emerald: "#006c49",
        mint: "#6cf8bb",
        amber: "#f9bd22",
        danger: "#ba1a1a"
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        metadata: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem"
      },
      maxWidth: {
        content: "1280px"
      }
    }
  },
  plugins: []
};

export default config;
