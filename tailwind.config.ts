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
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        accent: "#0066FF",
        "accent-hover": "#0052CC",
        "card-bg": "#111111",
        "card-border": "#1A1A1A",
        "text-secondary": "#888888",
        "text-tertiary": "#555555",
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
