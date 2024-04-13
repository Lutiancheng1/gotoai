import { DifyInfo, Token } from '@/store/types'
import { AccountInfo } from '@/types/app'

// 用户 Token 的本地缓存键名
const TOKEN_KEY = 'goto-ai-key'
// 用户信息的本地缓存键名
const USER_INFO = 'user-info'
// Dify 信息的本地缓存键名
const DIFY_INFO = 'dify-info'
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
export const getAccountInfo = (): AccountInfo => {
  // JSON.parse() 参数必须是string
  // localstorage.getItem()  获取到 string | null
  return JSON.parse(localStorage.getItem(USER_INFO) as string) || {}
}

/**
 * 将 Token 信息存入缓存
 * @param {Object} userInfo 从后端获取到的 帐号 信息
 */
export const setAccountInfo = (userInfo: AccountInfo) => {
  localStorage.setItem(USER_INFO, JSON.stringify(userInfo))
}

/**
 * 删除本地缓存中的 帐号 信息
 */
export const removeAccountInfo = () => {
  localStorage.removeItem(USER_INFO)
}

/**
 * 判断本地缓存中是否存在 帐号 信息
 */
export const hasAccountInfo = (): boolean => {
  return !!getAccountInfo()
}

/**
 * 从本地缓存中获取 Dify 配置信息
 */
export const getDifyInfo = (): DifyInfo => {
  // JSON.parse() 参数必须是string
  // localstorage.getItem()  获取到 string | null
  return JSON.parse(localStorage.getItem(DIFY_INFO) as string) || {}
}

/**
 * 将 Dify 信息存入缓存
 * @param {DifyInfo} difyInfo 从后端获取到的 Token 信息
 */
export const setDifyInfo = (difyInfo: DifyInfo) => {
  localStorage.setItem(DIFY_INFO, JSON.stringify(difyInfo))
}

/**
 * 删除本地缓存中的 Dify 信息
 */
export const removeDifyInfo = () => {
  localStorage.removeItem(DIFY_INFO)
}

/**
 *  判断本地缓存中是否存在 Dify 信息
 */
export const hasDifyInfo = () => {
  return !!getDifyInfo()
}
