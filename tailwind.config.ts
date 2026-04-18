import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "390px",
      },
      colors: {
        background: "#080810",
        foreground: "#FFFFFF",
        accent: "#6366f1",
        "accent-blue": "#3b82f6",
        "accent-hover": "#4f46e5",
        "card-bg": "#111118",
        "card-bg-2": "#1A1A24",
        "card-border": "#26272F",
        "text-secondary": "#94a3b8",
        "text-tertiary": "#7a8494",
        "noise-green": "#22C55E",
        "noise-yellow": "#EAB308",
        "noise-red": "#EF4444",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      keyframes: {
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "card-enter": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "page-enter": "page-enter 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
        "card-enter": "card-enter 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
