import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080711",
        violetGlow: "#9D4CFF",
        fuchsiaGlow: "#F04CFF",
        cyanGlow: "#27E6FF",
        limeGlow: "#B9FF66"
      },
      boxShadow: {
        neon: "0 0 32px rgba(157, 76, 255, .42)",
        panel: "0 24px 90px rgba(0, 0, 0, .4)"
      },
      backgroundImage: {
        "studio-grid":
          "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
