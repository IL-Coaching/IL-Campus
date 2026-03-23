import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/compartido/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/nucleo/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        marino: {
          DEFAULT: "var(--marino)",
          2: "var(--marino-2)",
          3: "var(--marino-3)",
          4: "var(--marino-4)",
        },
        naranja: {
          DEFAULT: "var(--naranja)",
          h: "var(--naranja-h)",
        },
        blanco: "var(--blanco)",
        gris: {
          DEFAULT: "var(--gris)",
          claro: "var(--gris-claro)",
        },
        rojo: "var(--rojo)",
        verde: "var(--verde)",
        azul: "var(--azul)",
        yellow: "var(--yellow)",
      },
      fontFamily: {
        barlow: ["var(--font-barlow)", "sans-serif"],
        "barlow-condensed": ["var(--font-barlow-condensed)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
