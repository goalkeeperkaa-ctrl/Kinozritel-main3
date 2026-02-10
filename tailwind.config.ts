import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--aidagis-bg)",
        pine: "var(--aidagis-pine)",
        terracotta: "var(--aidagis-terracotta)",
        ivory: "var(--aidagis-ivory)"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.24)"
      }
    }
  },
  plugins: []
};

export default config;