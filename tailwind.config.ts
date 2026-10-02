import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aero: {
          navy: "#070e1a",
          night: "#0b1528",
          dark: "#0f1f38",
          cobalt: "#172554",
          cyan: "#00d2ff",
          sky: "#0284c7",
          electric: "#38bdf8",
        },
        brand: {
          50: "#f0f8ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          800: "#0c4a6e",
          900: "#082f49",
          950: "#031c2e",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        'aero-sm': '0 2px 8px -2px rgba(2, 132, 199, 0.12), 0 1px 3px 0 rgba(15, 23, 42, 0.05)',
        'aero': '0 10px 25px -5px rgba(2, 132, 199, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        'aero-glow': '0 0 20px -3px rgba(0, 210, 255, 0.35)',
        'aero-card': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.8)',
      },
      animation: {
        'laser-scan': 'laserScan 2.5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        laserScan: {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0.1' },
          '50%': { transform: 'translateY(100%)', opacity: '0.6' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
