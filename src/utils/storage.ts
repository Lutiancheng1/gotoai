import { Token, UserInfo } from '@/types'

// 用户 Token 的本地缓存键名
const TOKEN_KEY = 'goto-ai-key'
const USER_INFO = 'user-info'

/**
 * 从本地缓存中获取 Token 信息
 */
export const getTokenInfo = (): Token => {
  // JSON.parse() 参数必须是string
  // localstorage.getItem()  获取到 string | null
  return JSON.parse(localStorage.getItem(TOKEN_KEY) as string) || {}
}

/**
 * 将 Token 信息存入缓存
 * @param {Object} tokenInfo 从后端获取到的 Token 信息
 */
export const setTokenInfo = (tokenInfo: Token) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenInfo))
}

/**
 * 删除本地缓存中的 Token 信息
 */
export const removeTokenInfo = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 判断本地缓存中是否存在 Token 信息
 */
export const hasToken = (): boolean => {
  return !!getTokenInfo().token
}

/**
 * 从本地缓存中获取 帐号 信息
 */
export const getUserInfo = (): UserInfo => {
  // JSON.parse() 参数必须是string
  // localstorage.getItem()  获取到 string | null
  return JSON.parse(localStorage.getItem(USER_INFO) as string) || {}
}

/**
 * 将 Token 信息存入缓存
 * @param {Object} userInfo 从后端获取到的 帐号 信息
 */
export const setUserInfo = (userInfo: UserInfo) => {
  localStorage.setItem(USER_INFO, JSON.stringify(userInfo))
}

/**
 * 删除本地缓存中的 帐号 信息
 */
export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO)
}

/**
 * 判断本地缓存中是否存在 帐号 信息
 */
export const hasUserInfo = (): boolean => {
  return !!getUserInfo()
}
