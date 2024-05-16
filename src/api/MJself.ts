// 画图相关接口
import Toast from '@/components/Toast'
import { TaskList } from '@/pages/DrawDesigns/index_new_1'
import { getTokenInfo } from '@/utils/storage'
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
  msg: string
  data: string
  properties: Property
}

const request = axios.create({
  timeout: 1000000000,
  baseURL: `${process.env.REACT_APP_BASE_URL}/Mj/`
})

// 2. 设置请求拦截器和响应拦截器
request.interceptors.request.use((config) => {
  config.headers!['Access-Control-Allow-Origin'] = '*'
  const token = getTokenInfo().token
  config.headers!['Authorization'] = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (response: AxiosResponse<MJResponse>) => {
    // code=1: 提交成功，data为任务ID
    // code = 22: 提交成功，进入队列等待
    if ((response.data as MJResponse).code === 0) {
      Toast.notify({
        type: 'success',
        message: '提交成功',
        duration: 1000
      })
    } else if ((response.data as MJResponse).code === 200 && (response.data as MJResponse).msg === 'Waiting for window confirm') {
      return response.data as unknown as AxiosResponse<MJResponse>
    } else if ((response.data as MJResponse).code === -1) {
      // code=21: 任务已存在，U时可能发生
      // code=23: 队列已满，请稍后尝试
      // code=24: prompt包含敏感词
      // other: 提交错误，description为错误描述
      const formatMsg = {
        'May contains sensitive words': '提示词包含敏感词',
        'The queue is full, please try again later': '队列已满，请稍后尝试',
        'base64List parameter error': 'base64列表参数错误',
        'In queue, there are 1 tasks ahead': '在队列中，前面有1个任务'
      } as {
        [key: string]: string
      }

      const formatErrorMessage = (errorMsg: string): string => {
        return formatMsg[errorMsg] || errorMsg
      }

      Toast.notify({
        type: 'error',
        message: formatErrorMessage(response.data.msg),
        duration: 1000
      })
    }
    return response.data as unknown as AxiosResponse<MJResponse>
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
  mode: 'RELAX' | 'FAST' // RELAX(慢速); FAST(极速),可用值:RELAX,FAST,示例值(RELAX)
  base64Array?: string[]
  prompt: string
  notifyHook?: string
  state?: string
  botType?: 'MID_JOURNEY' | 'NIJI_JOURNEY'
}

// 执行Imagine操作，提交绘图任务
export const submitDrawImagine = async (params: DrawParams) => {
  return (await request.post('Imagine', params)) as MJResponse
}

export interface ActionParams {
  mode: 'RELAX' | 'FAST'
  notifyHook?: string
  customId: string // customId通过任务查询接口可以获取到。
  taskId: string
  state?: string
  botType?: 'MID_JOURNEY' | 'NIJI_JOURNEY'
}

// 提交action任务 该接口是用于点击图片下方的按钮
export const submitDrawAction = async (params: ActionParams) => {
  return (await request.post('Action', params)) as MJResponse
}

export interface BlendParams {
  mode: 'RELAX' | 'FAST'
  notifyHook?: string
  base64Array: string[]
  dimensions?: DimensionsType //	"比例:PORTRAIT(2:3);SQUARE(1:1);LANDSCAPE(3:2),可用值:PORTRAIT,SQUARE,LANDSCAPE,示例值(SQUARE)"
  state?: string
  botType?: 'MID_JOURNEY' | 'NIJI_JOURNEY'
}
export type DimensionsType = 'PORTRAIT' | 'SQUARE,' | 'LANDSCAPE'
//  执行Blend操作，提交融图任务。
export const submitBlend = async (params: BlendParams) => {
  return (await request.post('Blend', params)) as MJResponse
}

export interface ModalParams {
  maskBase64?: string //局部重绘的蒙版base64，示例值 (data:image/png;base64,xxx)
  prompt: string
  taskId: string
}
// 提交Modal任务
export const submitModal = async (params: ModalParams) => {
  return (await request.post('Modal', params)) as MJResponse
}

export interface DescribeParams {
  mode: 'RELAX' | 'FAST'
  base64: string // 图片base64,示例值 (data:image/png;base64,xxx)
  notifyHook?: string
  state?: string
}
// 执行Describe操作，提交图生文任务。
export const submitDescribe = async (params: DescribeParams) => {
  return (await request.post('Describe', params)) as MJResponse
}
export interface ShortenParams {
  mode: 'RELAX' | 'FAST'
  notifyHook?: string
  prompt: string
  state?: string
}
// 提交Shorten任务
export const submitShorten = async (params: ShortenParams) => {
  return (await request.post('Shorten', params)) as MJResponse
}

export interface FaceSwapParams {
  mode: 'RELAX' | 'FAST'
  notifyHook?: string
  sourceBase64: string // 人脸源图片base64,示例值(data:image/png;base64,xxx1)
  targetBase64: string //目标图片base64,示例值(data:image/png;base64,xxx2)
  state?: string
}
// 提交FaceSwap任务，进行换脸操作。
export const submitFaceSwap = async (params: FaceSwapParams) => {
  return await request.post('FaceSwap', params)
}

//  指定id查询任务
export const getTaskById = async (id: string) => {
  return await request.get(`Task/${id}`)
}

//获取任务图片的seed
export const getSeed = async (id: string) => {
  return await request.get(`mj/task/${id}/image-seed`)
}
// 删除任务
export const deleteTask = async (taskId: string) => {
  return (await request.get(`Cancel?taskId=${taskId}`)) as MJResponse
}

export interface TaskListParams {
  current: number
  pageNum: number
  pageSize: number
  status?: 'NOT_START' | 'SUBMITTED' | 'MODAL' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE' | 'CANCEL'
}
export interface TaskListResponse {
  code?: number
  pageCount: number
  pageIndex: number
  recordCount: number
  rows: TaskList[]
}

//查询所有任务
export const getTaskList = async ({ page, pageSize }: { page: number; pageSize: number }) => {
  const res = (await request.post('TaskList', { page, pageSize })) as TaskListResponse
  if (res.code === 200) {
    return res
  }
}

//查询任务队列
export const getTaskQueue = async () => {
  const res = (await request.post('UserTasks', { page: 1, pageSize: 100 })) as TaskListResponse
  if (res.code === 200) {
    return res
  }
}
