/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",           // если что-то используешь в html
    "./src/**/*.{js,jsx,ts,tsx}"  // ⚠️ важно: jsx включён
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}