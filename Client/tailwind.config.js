/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      animation: {
        fade: "fadeIn 1s ease-in-out",
        fadeInUp: "fadeInUp 0.8s ease-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary_blue: "#2876FF",
        text_black: "#161616",
        bg_gray: "#DFDFDF",
        highlight: "#D7E8FF",
        card_dark_blue: "#205ECC",
      },
      fontFamily: {
        "sfpd-regular": ["sfpd-regular", "system-ui", "sans-serif"],
        "sfpd-semibold": ["sfpd-semibold", "system-ui", "sans-serif"],
        "sfpd-bold": ["sfpd-bold", "system-ui", "sans-serif"],
        "sfpd-light": ["sfpd-light", "system-ui", "sans-serif"],
      },
      dropShadow: {
        "3xl": "0 10px 10px rgba(255, 255, 255, 0.30)",
      },
      screens: {
        xs: "375px",
      },
      boxShadow: {
        allside: "1px 1px 20px -4px rgba(0, 0, 0, 0.25)",
        allsideSmall: "1px 1px 12px -4px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};
