import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ehv: {
          red: "#E41613",
          "red-dark": "#B71110",
          ink: "#1A1A1A",
          grey: "#F4F4F5",
          "grey-mid": "#E4E4E7",
          "grey-line": "#D4D4D8",
          green: "#1E7A34",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
