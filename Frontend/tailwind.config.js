/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bbfc",
          400: "#8194f8",
          500: "#6366f1",
          600: "#4F46E5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        warm: { background: "#FAFAF9", text: "#1C1917", muted: "#78716C", border: "#E7E5E4", gold: "#F59E0B" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        // Used for the large statements on the marketing and auth screens. A warm
        // serif gives those headings a voice that Inter alone cannot.
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        // A warm shadow rather than a grey one, so cards sit in the palette.
        soft: "0 1px 2px rgba(28, 25, 23, 0.04), 0 12px 32px -12px rgba(28, 25, 23, 0.18)",
      },
    },
  },
  plugins: [],
};
