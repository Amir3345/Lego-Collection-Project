/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.html`],
  daisyui: {
    themes: ["cyberpunk"],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

