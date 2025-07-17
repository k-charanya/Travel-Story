/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily:{
      display:["Poppins","sans-serif"],
    },
    extend: {
      //colors used in project
      colors:{
        primary:"#05B6D3",
        secondary:"#EF863E",
      },
      backgroundImage:{
        'login-bg-img': "url('./src/assets/bg-1.jpeg')",
        'signup-bg-image':"url('./src/assets/bg-2.jpg')",
        
      }
    },
  },
  plugins: [],
}

