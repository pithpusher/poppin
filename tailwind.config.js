/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: { xl2: "var(--radius)" },
      boxShadow: { card: "var(--shadow)" },
      colors: {
        brand: "rgb(var(--brand))",
        panel: "rgb(var(--panel))",
        text: "rgb(var(--text))",
        muted: "rgb(var(--muted))",
        borderToken: "rgb(var(--border-color))",
      },
      fontFamily: {
        sans: ["Open Sans","ui-sans-serif","system-ui"],
        heading: ["Lekton","ui-sans-serif","system-ui"],
      },
    },
  },
  plugins: [],
};
