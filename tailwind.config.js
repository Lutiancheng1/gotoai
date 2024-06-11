// @ts-nocheck
/** @type {import('tailwindcss').Config} */
const em = (px) => `${px / 16}em`
const rem = (px) => ({ [px]: `${px / 16}rem` })
const px = (num) => ({ [num]: `${num}px` })

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,js,tsx}'],
  theme: {
    extend: {
      display: ['group-hover'],
      colors: {
        'bubble-bg': '#fff', // 自定义背景颜色
        'bubble-text': '#1f2328' // 自定义字体颜色
      },
      fontWeight: {
        100: '100',
        200: '200',
        300: '300',
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
        900: '900'
      },
      screens: {
        sm: em(640),
        md: em(768),
        lg: em(1024),
        xl: em(1280)
      },
      borderWidth: {
        ...px(2),
        ...px(3),
        ...px(5)
      },
      fontSize: {
        ...rem(12),
        ...rem(13),
        ...px(10),
        ...px(11),
        ...px(12),
        ...px(13),
        ...px(14),
        ...px(15),
        ...px(16),
        ...px(17),
        ...px(18),
        ...px(19),
        ...px(20),
        ...px(21),
        ...px(22),
        ...px(23),
        ...px(24),
        ...px(25),
        ...px(26),
        ...px(27),
        ...px(28),
        ...px(29),
        ...px(30),
        ...px(31),
        ...px(32),
        ...px(40)
      }
    }
  },

  // add daisyUI plugin
  plugins: [require('daisyui')],

  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: ['light'], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: '*' // The element that receives theme color CSS variables
  }
}
