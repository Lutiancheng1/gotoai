declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

export interface AccountInfo {
  username: string
  password: string
}
export type ShartChatResp = {
  conversationId: string
  chatId: number
}
