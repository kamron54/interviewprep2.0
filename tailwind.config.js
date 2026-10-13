/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// The look: navy ink on warm paper, Fraunces headlines, evergreen accent (src/index.css)
  		fontFamily: {
  			sans: ['"Source Sans 3 Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
  			display: ['"Fraunces Variable"', 'Georgia', 'serif'],
  			hand: ['"Caveat Variable"', 'cursive'],
  		},
  		// Shadows tinted with the ink color instead of black
  		boxShadow: {
  			sm: '0 1px 2px 0 rgb(20 35 60 / 0.06)',
  			DEFAULT: '0 1px 3px 0 rgb(20 35 60 / 0.08), 0 1px 2px -1px rgb(20 35 60 / 0.06)',
  			md: '0 4px 6px -1px rgb(20 35 60 / 0.08), 0 2px 4px -2px rgb(20 35 60 / 0.06)',
  			lg: '0 10px 24px -6px rgb(20 35 60 / 0.14), 0 4px 8px -4px rgb(20 35 60 / 0.06)',
  			xl: '0 20px 32px -8px rgb(20 35 60 / 0.16), 0 8px 12px -6px rgb(20 35 60 / 0.06)',
  		},
  		colors: {
  			// Every gray-* class on the site: warm paper tones for backgrounds and borders (50–300),
  			// navy ink tones for text (400–950)
  			gray: {
  				50: '#F3EEE5',
  				100: '#ECE5D9',
  				200: '#E6DFD3',
  				300: '#D4CABA',
  				400: '#9298A0',
  				500: '#626B7A',
  				600: '#4B5667',
  				700: '#344155',
  				800: '#223047',
  				900: '#14233C',
  				950: '#0C1628',
  			},
  			// Every teal-* class on the site becomes the evergreen accent (600 is the brand color)
  			teal: {
  				50: '#EEF5F2',
  				100: '#D7E9E3',
  				200: '#B0D3C8',
  				300: '#82B8A9',
  				400: '#4F9886',
  				500: '#2C7D6C',
  				600: '#1E6B5C',
  				700: '#185A4D',
  				800: '#14493F',
  				900: '#103B33',
  				950: '#08221D',
  			},
  			ink: 'rgb(var(--ink) / <alpha-value>)',
  			paper: 'rgb(var(--paper) / <alpha-value>)',
  			surface: 'rgb(var(--surface) / <alpha-value>)',
  			line: 'rgb(var(--line) / <alpha-value>)',
  			brand: 'rgb(var(--brand) / <alpha-value>)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"),
  require("@tailwindcss/typography")],
}
