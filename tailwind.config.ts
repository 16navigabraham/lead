import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(6%,-8%,0) scale(1.15)" },
          "66%": { transform: "translate3d(-6%,6%,0) scale(0.9)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "ping-ring": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "80%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        aurora: "aurora 18s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        "ping-ring": "ping-ring 2.4s cubic-bezier(0,0,0.2,1) infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 6s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
