// 画图相关接口
import Toast from '@/components/Toast'
import axios, { AxiosError, AxiosResponse } from 'axios'
export interface Property {
  status: string
  imageUrl: string
  promptEn: string
  bannedWord: string
  numberOfQueues: number
  discordInstanceId: string
}

export interface RootObject {
  code: number
  description: string
  result: string
  properties: Property
}

const request = axios.create({
  timeout: 20000,
  baseURL: 'http://52.175.37.113:8082/mj'
  // baseURL: 'http://47.236.194.250:8062/v1/api'
})

// 2. 设置请求拦截器和响应拦截器
request.interceptors.request.use((config) => {
  config.headers!['Access-Control-Allow-Origin'] = '*'
  // 设置请求头的 Authorization 字段
  config.headers!['Authorization'] = `Bearer ${'MTE5Mzc2NTA1NzY2MjgzMjY3NA.Gmxibo.Gy6bhWRoeJoRkCCjwyHtzkgu8F9iPKxShhDcRE'}`
  return config
})

request.interceptors.response.use(
  (response: AxiosResponse) => {
    // code=1: 提交成功，result为任务ID
    // code = 22: 提交成功，进入队列等待
    if ((response.data as RootObject).code === 1 || (response.data as RootObject).code === 22) {
      Toast.notify({
        type: 'success',
        message: response.data.description,
        duration: 1000
      })
    } else {
      // code=21: 任务已存在，U时可能发生
      // code=23: 队列已满，请稍后尝试
      // code=24: prompt包含敏感词
      // other: 提交错误，description为错误描述
      Toast.notify({
        type: 'error',
        message: response.data.description,
        duration: 1000
      })
    }
    return response.data
  },
  async (error: AxiosError<{ message: string }>) => {
    if (!error.response) {
      // 如果因为网络原因 请求超时没有response
      Toast.notify({ type: 'error', message: '网络错误' })
      return Promise.reject(error)
    }
  }
)
export interface DrawParams {
  base64Array?: string[]
  dimensions?: string
  notifyHook?: string
  state?: string
}
export const MJdraw = (params: DrawParams) => {
  return request.post('submit/imagine')
}
export default request
