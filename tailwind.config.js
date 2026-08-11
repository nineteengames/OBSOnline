/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obs: {
          bg: '#1c1c1c',        // Main application background
          dock: '#222222',      // Dock background
          header: '#2b2b2b',    // Dock header / Menu bar background
          border: '#333333',    // General borders
          borderLight: '#555555',
          text: '#cccccc',      // Default text
          textLight: '#ffffff', // Highlighted text
          accent: '#226699',    // OBS Blue accent
          accentHover: '#2a7ab8',
          button: '#383838',    // Button background
          buttonHover: '#4d4d4d',
          buttonActive: '#2b2b2b',
          red: '#cc3333',       // Recording red
          green: '#33cc33',     // Streaming green
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
