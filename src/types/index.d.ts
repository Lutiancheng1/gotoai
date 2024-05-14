declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

declare namespace JSX {
  interface IntrinsicElements {
    'wc-waterfall': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & import('wc-waterfall').WaterfallProps, HTMLElement>
  }
}
