// 画图相关接口 废弃
import Toast from '@/components/Toast'
import { TaskList } from '@/pages/DrawDesigns'
import axios, { AxiosError, AxiosResponse } from 'axios'
export interface Property {
  status: string
  imageUrl: string
  promptEn: string
  bannedWord: string
  numberOfQueues: number
  discordInstanceId: string
}

export interface MJResponse {
  code: number
  description: string
  result: string
  properties: Property
}

const request = axios.create({
  timeout: 30000,
  baseURL: process.env.REACT_APP_BASE_URL_MJ
})

// 2. 设置请求拦截器和响应拦截器
request.interceptors.request.use((config) => {
  config.headers!['Access-Control-Allow-Origin'] = '*'
  config.headers!['Content-Type'] = 'application/json'
  return config
})

request.interceptors.response.use(
  (response: AxiosResponse) => {
    // code=1: 提交成功，result为任务ID
    // code = 22: 提交成功，进入队列等待
    if ((response.data as MJResponse).code === 1 || (response.data as MJResponse).code === 22) {
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
      Toast.notify({ type: 'error', message: '请求超时' })
      return Promise.reject(error)
    }
  }
)
export interface DrawParams {
  base64Array?: string[]
  prompt: string
  notifyHook?: string
  state?: string
  botType?: 'MID_JOURNEY'
}

export interface ChangeParams {
  action: 'UPSCALE' | 'VARIATION' | 'REROLL' // UPSCALE(放大); VARIATION(变换); REROLL(重新生成),可用值:UPSCALE,VARIATION,REROLL,示例值(UPSCALE)
  index?: number // 序号(1~4), action为UPSCALE,VARIATION时必传,示例值(1)
  notifyHook?: string
  state?: string
  taskId: string
}
/**
 * Submits a drawing request to the server.
 *
 * @param {DrawParams} params - The parameters for the drawing request.
 * @param {string[]} [params.base64Array] - An array of base64-encoded images.
 * @param {string} params.prompt - The prompt for the drawing request.
 * @param {string} [params.notifyHook] - A notification hook.
 * @param {string} [params.state] - State.
 * @param {string} [params.botType] - The type of the bot (default: 'MID_JOURNEY').
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const submitDrawImagine = async (params: DrawParams) => {
  return await request.post('submit/imagine', JSON.stringify(params))
}

/**
 * Submits a change request to the server.
 *
 * @param {ChangeParams} params - The parameters for the change request.
 * @param {('UPSCALE' | 'VARIATION' | 'REROLL')} params.action - The type of change to perform.
 * @param {number} [params.index] - The index of the item to change (1-4), required for UPSCALE and VARIATION.
 * @param {string} [params.notifyHook] - A notification hook.
 * @param {string} [params.state] - State.
 * @param {string} params.taskId - The ID of the task to change.
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const submitDrawChange = async (params: ChangeParams) => {
  return (await request.post('submit/change', JSON.stringify(params))) as MJResponse
}

export interface BlendParams {
  base64Array: string[] //图片base64数组,示例值
  dimensions?: 'PORTRAIT' | 'SQUARE,' | 'LANDSCAPE' // PORTRAIT(2:3); SQUARE(1:1); LANDSCAPE(3:2),
  notifyHook?: string
  state?: string
}
// 提交blend任务
export const submitBlend = async (params: BlendParams) => {
  return await request.post('submit/blend', JSON.stringify(params))
}

export interface DescribeParams {
  base64: string // 图片base64,示例值 (data:image/png;base64,xxx)
  notifyHook?: string
  state?: string
}

/**
 * Submits a Describe task to the server.
 *
 * @param {DescribeParams} params - The parameters for the Describe task.
 * @param {string[]} params.base64Array - An array of base64 encoded images.
 * @param {('PORTRAIT' | 'SQUARE,' | 'LANDSCAPE')} [params.dimensions] - The dimensions of the images (default: 'PORTRAIT(2:3)').
 * @param {string} [params.notifyHook] - A notification hook.
 * @param {string} [params.state] - State.
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const submitDescribe = async (params: DescribeParams) => {
  return await request.post('submit/describe', JSON.stringify(params))
}

export interface SimpleChange {
  content: string // 变化描述: ID + $action$index,示例值(1320098173412546 U2)
  notifyHook?: string
  state?: string
}

/**
 * Submits a Simple Change task to the server.
 *
 * @param {SimpleChange} params - The parameters for the Simple Change task.
 * @param {string} params.content - The description of the change in the format "ID + $action$index", e.g. "1320098173412546 U2".
 * @param {string} [params.notifyHook] - A notification hook.
 * @param {string} [params.state] - State.
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const submitSimpleChange = async (params: SimpleChange) => {
  // Send a POST request to 'submit/simple-change' with the task parameters in JSON format.
  return await request.post('submit/simple-change', JSON.stringify(params))
}

//查询所有任务
export const getTaskList = async () => {
  return (await request.get('task/list')) as TaskList[]
}

/**
 * Retrieves a list of tasks based on the provided IDs.
 *
 * @param {string[]} ids - An array of task IDs.
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const getTaskListByIds = async (ids: string[]) => {
  return await request.get('task/list', { params: { ids: ids.join(',') } })
}

//查询任务队列
export const getTaskQueue = async () => {
  return (await request.get('task/queue')) as TaskList[]
}

/**
 * Retrieves a specific task by its ID.
 *
 * @param {string} id - The ID of the task.
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const getTaskById = async (id: string) => {
  return await request.get(`task/${id}/fetch`)
}

// 查询所有账号
export const getAccountList = async () => {
  return await request.get('account/list')
}

/**
 * Retrieves a specific account by its ID.
 *
 * @param {string} id - The ID of the account.
 * @returns {Promise<any>} - A promise that resolves to the server's response.
 */
export const getAccountById = async (id: string) => {
  return await request.get(`account/${id}/fetch`)
}
export default request
