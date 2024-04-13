import Toast from '@/components/Toast'

import axios from 'axios'

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function asyncRunSafe<T = any>(fn: Promise<T>): Promise<[Error] | [null, T]> {
  try {
    return [null, await fn]
  } catch (e) {
    if (e instanceof Error) return [e]
    return [new Error('unknown error')]
  }
}

export const getTextWidthWithCanvas = (text: string, font?: string) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.font = font ?? '12px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    return Number(ctx.measureText(text).width.toFixed(2))
  }
  return 0
}

const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

export function randomString(length: number) {
  let result = ''
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export const getPurifyHref = (href: string) => {
  if (!href) return ''

  return href
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
}

export const ipInCN = async () => {
  const res = await axios('https://api.ipify.org')
  if (res.status === 200) {
    if (await checkIP(res.data as string)) {
      Toast.notify({
        type: 'info',
        message: '当前ip在国内,可能无法正常对话'
      })
      return true
    } else {
      Toast.notify({
        type: 'success',
        message: '当前ip不在国内'
      })
    }
  }
  return false
}
type Ip = {
  as: string
  city: string
  country: string
  countryCode: string
  isp: string
  lat: number
  lon: number
  org: string
  query: string
  region: string
  regionName: string
  status: string
  timezone: string
  zip: string
}
export const checkIP = async (ip: string) => {
  try {
    const response = (await axios.get(`http://ip-api.com/json/${ip}`)) as Ip
    if (response.status === 'success') {
      if (response.countryCode === 'CN') {
        // if (response.countryCode === 'CN' || response.countryCode === 'HK' || response.countryCode === 'TW' || response.countryCode === 'Macao') {
        return true
      } else {
        return false
      }
    }
  } catch (error) {
    Toast.notify({
      type: 'error',
      message: '查询错误'
    })
  }
}
