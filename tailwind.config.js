/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'chewy': ['Chewy', 'cursive'],
        'spartan': ['League Spartan', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}