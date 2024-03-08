/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.ejs`],
  daisyui: {
    themes: ["cyberpunk"],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

