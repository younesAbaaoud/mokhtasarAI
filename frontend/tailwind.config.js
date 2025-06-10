/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  './pages/**/*.{js,ts,jsx,tsx,mdx}',
	  './components/**/*.{js,ts,jsx,tsx,mdx}',
	  './app/**/*.{js,ts,jsx,tsx,mdx}',
	  './src/**/*.{ts,tsx}',
	],
	theme: {
	  container: {
		center: true,
		padding: "2rem",
		screens: {
		  "2xl": "1400px",
		},
	  },
	  extend: {
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		colors: {
		  // Core colors (required by ShadCN)
		  border: "var(--border)",
		  input: "var(--input)",
		  ring: "var(--ring)",
		  background: "var(--background)",
		  foreground: "var(--foreground)",
		  primary: {
			DEFAULT: "var(--primary)",
			foreground: "var(--primary-foreground)",
		  },
		  secondary: {
			DEFAULT: "var(--secondary)",
			foreground: "var(--secondary-foreground)",
		  },
		  destructive: {
			DEFAULT: "var(--destructive)",
			foreground: "var(--destructive-foreground)",
		  },
		  muted: {
			DEFAULT: "var(--muted)",
			foreground: "var(--muted-foreground)",
		  },
		  accent: {
			DEFAULT: "var(--accent)",
			foreground: "var(--accent-foreground)",
		  },
		  
		  // Notre palette de couleurs personnalisée
		  cream: "#f3f3e7",
		  navy: "#133E87",
		  blue: "#608BC1",
		  "blue-light": "#CBDCEB",
		  
		  // Couleurs supplémentaires pour l'interface
		  'primary-light': "#608BC1",  // Bleu principal plus clair (notre blue)
		  'primary-pale': "#CBDCEB",   // Bleu très clair (notre blue-light)
		  card: {
			DEFAULT: "#f3f3e7",
			foreground: "#133E87",
		  },
		},
		keyframes: {
		  "accordion-down": {
			from: { height: 0 },
			to: { height: "var(--radix-accordion-content-height)" },
		  },
		  "accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: 0 },
		  },
		  "float": {
			"0%, 100%": { transform: "translateY(0)" },
			"50%": { transform: "translateY(-10px)" }
		  },
		  "pulse-soft": {
			"0%, 100%": { opacity: 1 },
			"50%": { opacity: 0.8 }
		  }
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  "float": "float 6s ease-in-out infinite",
		  "pulse-soft": "pulse-soft 3s ease-in-out infinite"
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }