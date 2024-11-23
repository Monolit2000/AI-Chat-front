/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Указываем пути к файлам Angular
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#26282C',
        customBgForChat: '#131417',
      },
    },
  },
  plugins: [
    
  ],
}

