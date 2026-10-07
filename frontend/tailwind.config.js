import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        helpdeskLight: {
          "primary": "#0F172A",
          "primary-content": "#FFFFFF",
          "secondary": "#2563EB",
          "secondary-content": "#FFFFFF",
          "accent": "#10B981",
          "accent-content": "#FFFFFF",
          "neutral": "#1E293B",
          "neutral-content": "#F8FAFC",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "base-content": "#0F172A",
          "info": "#0284C7",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
        helpdeskDark: {
          "primary": "#FFFFFF",
          "primary-content": "#0F172A",
          "secondary": "#3B82F6",
          "secondary-content": "#FFFFFF",
          "accent": "#10B981",
          "accent-content": "#0F172A",
          "neutral": "#1E293B",
          "neutral-content": "#F8FAFC",
          "base-100": "#0F172A",
          "base-200": "#0B1120",
          "base-300": "#1E293B",
          "base-content": "#F8FAFC",
          "info": "#38BDF8",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
      "light",
      "dark"
    ],
    darkTheme: "helpdeskDark",
  },
}
