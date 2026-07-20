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
        surface: {
          DEFAULT: "#faf7f0",
          raised: "#f7f2e9",
          overlay: "#f4efe4",
        },
        border: {
          subtle: "rgba(62, 52, 42, 0.08)",
          DEFAULT: "rgba(62, 52, 42, 0.12)",
        },
        accent: {
          DEFAULT: "#3d4f5c",
          muted: "#2f3e49",
          glow: "rgba(61, 79, 92, 0.2)",
        },
        ink: {
          DEFAULT: "#2c2825",
          muted: "#5c534a",
          faint: "#8a8178",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Nunito",
          "system-ui",
          "Segoe UI",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Libre Baskerville",
          "Baskerville",
          "Georgia",
          "serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-50%, 0, 0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "radar-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.92" },
          "50%": { transform: "scale(1.03)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        fadeUp: "fadeUp 0.65s ease-out both",
        marquee: "marquee 42s linear infinite",
        shimmer: "shimmer 2s infinite",
        fadeSlide: "fadeSlide 0.42s ease-out both",
        "radar-breathe": "radar-breathe 5.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
