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
        // ── Design-system tokens (audit package 1/9) ─────────────────────
        // All values resolve to CSS custom properties in :root (globals.css).
        // Change a token there, every utility class picks it up.
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-card": "var(--bg-card)",
        "bg-overlay": "var(--bg-overlay)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
        accent: {
          // <alpha-value> lets bg-accent/10, border-accent/30 etc. work by
          // substituting the opacity the modifier declares. Channels come
          // from --accent-rgb (space-separated) in globals.css.
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          hover: "var(--accent-hover)",
          glow: "var(--accent-glow)",
          ink: "var(--accent-ink)",
        },
        warm: "var(--warm)",
        warn: "var(--warn)",
        danger: "var(--danger)",
        success: "var(--success)",

        // ── Backward-compat aliases ──
        // Existing utility classes across the codebase (bg-background,
        // text-foreground, bg-card-bg, border-card-border, text-text-secondary,
        // text-text-tertiary, bg-accent-hover, etc.) keep working by aliasing
        // to the new tokens. Package 7 can rename call sites at leisure.
        background: "var(--bg)",
        foreground: "var(--text)",
        "accent-blue": "#3b82f6",
        "accent-hover": "var(--accent-hover)",
        "card-bg": "var(--bg-card)",
        "card-bg-2": "var(--bg-overlay)",
        "card-border": "var(--border-strong)",
        "text-secondary": "var(--text-muted)",
        "text-tertiary": "var(--text-subtle)",
        "noise-green": "#22C55E",
        "noise-yellow": "#EAB308",
        "noise-red": "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        gutter: "24px",
        block: "48px",
        section: "96px",
        "section-lg": "128px",
      },
      keyframes: {
        "card-enter": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "card-enter": "card-enter 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
