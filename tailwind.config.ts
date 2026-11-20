import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-contrast": "var(--primary-contrast)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
      },
      fontFamily: {
        read: ["var(--font-amiri)", "Traditional Arabic", "serif"],
        ui: ["var(--font-tajawal)", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        measure: "42em",
      },
      boxShadow: {
        soft: "0 10px 30px -14px rgba(22, 66, 60, .35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in .2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
