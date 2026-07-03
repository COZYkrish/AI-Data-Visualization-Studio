const { tailwindConfig } = require("../../packages/config/index.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...tailwindConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...tailwindConfig.theme,
    extend: {
      ...(tailwindConfig.theme?.extend ?? {}),
      fontFamily: {
        outfit: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        jakarta: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ...(tailwindConfig.theme?.extend?.colors ?? {}),
        landing: {
          bg: "#FAFAF7",
          "bg-dark": "#0B0A12",
          surface: "#FFFFFF",
          border: "#E8E8E0",
          violet: "#7C3AED",
          "violet-light": "#A78BFA",
          pink: "#F43F5E",
          yellow: "#FBBF24",
          emerald: "#10B981",
          cyan: "#06B6D4",
          orange: "#F97316",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 7s ease-in-out infinite 1s",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "pulse-glow-pink": "pulse-glow-pink 2.5s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "spin-slow-reverse": "spin-slow-reverse 25s linear infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "draw-line": "draw-line 2s ease-out forwards",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "gradient-shift": "gradient-shift 4s linear infinite",
        "particle-drift": "particle-drift 4s ease-in-out infinite",
        "dash-march": "dash-march 0.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(2deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(-2deg)" },
          "66%": { transform: "translateY(-14px) rotate(1deg)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.4)",
          },
          "50%": { boxShadow: "0 0 0 20px rgba(124, 58, 237, 0)" },
        },
        "pulse-glow-pink": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(244, 63, 94, 0.4)" },
          "50%": { boxShadow: "0 0 0 16px rgba(244, 63, 94, 0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-slow-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0) rotate(-10deg)",
            opacity: "0",
          },
          "60%": {
            transform: "scale(1.15) rotate(3deg)",
            opacity: "1",
          },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "particle-drift": {
          "0%": {
            transform: "translateY(0px) translateX(0px)",
            opacity: "0",
          },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": {
            transform: "translateY(-80px) translateX(20px)",
            opacity: "0",
          },
        },
        "dash-march": {
          from: { strokeDashoffset: "20" },
          to: { strokeDashoffset: "0" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backgroundImage: {
        "dot-pattern": "radial-gradient(circle, #D1D0CB 1px, transparent 1px)",
        "dot-pattern-dark":
          "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
        "gradient-vivid":
          "linear-gradient(135deg, #7C3AED 0%, #F43F5E 50%, #FBBF24 100%)",
        "gradient-aurora":
          "linear-gradient(90deg, #10B981 0%, #06B6D4 33%, #7C3AED 66%, #F43F5E 100%)",
        "gradient-hero":
          "radial-gradient(ellipse at 60% 0%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 80%, rgba(244,63,94,0.1) 0%, transparent 50%)",
      },
      backgroundSize: {
        "dot-sm": "24px 24px",
      },
      boxShadow: {
        "hard-violet": "4px 4px 0px #7C3AED",
        "hard-pink": "4px 4px 0px #F43F5E",
        "hard-yellow": "4px 4px 0px #FBBF24",
        "hard-emerald": "4px 4px 0px #10B981",
        "hard-lg-violet": "6px 6px 0px #7C3AED",
        glow: "0 0 30px rgba(124, 58, 237, 0.3)",
        "glow-pink": "0 0 30px rgba(244, 63, 94, 0.3)",
        float: "0 20px 60px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06)",
        "float-dark": "0 20px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
      },
    },
  },
};
