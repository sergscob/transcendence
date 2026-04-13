/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",           // если что-то используешь в html
    "./src/**/*.{js,jsx,ts,tsx}"  // ⚠️ важно: jsx включён
  ],
   theme: {
    extend: {
		// backgroundImage: {
		// 	'brickBg':"url('/src/assets/images/brick-bg.jpg')",
		// }
	},
  },
  plugins: [],
}
