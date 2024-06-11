import axios, { AxiosError, AxiosResponse } from 'axios'
import { getTokenInfo, removeTokenInfo } from './storage'
import Toast from '@/components/Toast'
export const httpBaseURL = process.env.REACT_APP_BASE_URL
export const http = axios.create({
  timeout: 1000000000,
  baseURL: httpBaseURL
})

// 2. 设置请求拦截器和响应拦截器
http.interceptors.request.use((config) => {
  config.headers!['Access-Control-Allow-Origin'] = '*'
  // 获取缓存中的 Token 信息
  const token = getTokenInfo().token
  if (token) {
    // 设置请求头的 Authorization 字段
    config.headers!['Authorization'] = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data.code === -1) {
      Toast.notify({
        type: 'error',
        message: response.data.message,
        duration: 1000
      })
    }
    if (response.data.code === -401) {
      Toast.notify({
        type: 'warning',
        message: '登陆过期,请重新登陆',
        duration: 1000
      })

      // 清除token
      removeTokenInfo()
      // 跳转到登陆页面
      window.location.href = '/login'
      return Promise.reject(response)
    }
    return response.data
  },
  async (error: AxiosError<{ message: string }>) => {
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(error)
    }
    if (!error.response) {
      // 如果因为网络原因 请求超时没有response
      Toast.notify({ type: 'error', message: '网络错误' })
      return Promise.reject(error)
    }
    // 如果不是401错误
    // 代表网络没问题 有数据
    if (error.response.status !== 401) {
      // 如果不是401错误
      Toast.notify({
        type: 'error',
        message: error.response.data.message,
        duration: 1000
      })
      return Promise.reject(error)
    }
  }
)
