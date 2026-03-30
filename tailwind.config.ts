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
        "card-bg": "#0f101a",
        "card-border": "#1e2035",
        "text-secondary": "#94a3b8",
        "text-tertiary": "#64748b",
        "noise-green": "#22C55E",
        "noise-yellow": "#EAB308",
        "noise-red": "#EF4444",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
