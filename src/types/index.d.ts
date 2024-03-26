declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

export interface Token {
  token: string
  // refresh_token: string
}

export interface UserInfo {
  username: string
  password: string
}
