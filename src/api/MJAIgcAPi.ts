// 画图相关接口
import Toast from '@/components/Toast'
import { TaskList } from '@/pages/DrawDesigns/index_new'
import axios, { AxiosError, AxiosResponse } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    customConfig?: {
      type: 'user' | 'mj'
    }
  }
}

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
  baseURL: 'https://aigc.api4midjourney.com/api/'
})

// 2. 设置请求拦截器和响应拦截器
request.interceptors.request.use((config) => {
  config.headers!['Access-Control-Allow-Origin'] = '*'
  // 检查自定义配置来决定使用Token还是密钥
  if (config.customConfig?.type === 'user') {
    // 对于"user"接口，使用Token
    config.headers!['access-Token'] = localStorage.getItem('mj_token')
  } else if (config.customConfig?.type === 'mj') {
    // 对于"mj"接口，使用密钥
    config.headers!['Authorization'] = `697fa3af-d37f-4da4-8c5f-bce9b8cb8307`
  }

  // 删除自定义配置，以防止发送到服务器
  delete config.customConfig
  return config
})

request.interceptors.response.use(
  (response: AxiosResponse<MJResponse>) => {
    if (response.data.code === 1010) {
      // 需要登陆
      MJlogin()
    }
    // code=1: 提交成功，result为任务ID
    // code = 22: 提交成功，进入队列等待
    if ((response.data as MJResponse).code === 1 || (response.data as MJResponse).code === 22) {
      Toast.notify({
        type: 'success',
        message: response.data.description,
        duration: 1000
      })
    } else if ((response.data as MJResponse).code === 24) {
      Toast.notify({
        type: 'error',
        message: '提示词包含敏感词',
        duration: 1000
      })
    } else if ((response.data as MJResponse).code === 21) {
      return response.data as unknown as AxiosResponse<MJResponse>
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
  return (await request.post('mj/submit/imagine', params, {
    customConfig: {
      type: 'mj'
    }
  })) as MJResponse
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
  return (await request.post('mj/submit/action', params, {
    customConfig: {
      type: 'mj'
    }
  })) as MJResponse
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
  return (await request.post('mj/submit/blend', params, {
    customConfig: {
      type: 'mj'
    }
  })) as MJResponse
}

export interface ModalParams {
  maskBase64?: string //局部重绘的蒙版base64，示例值 (data:image/png;base64,xxx)
  prompt: string
  taskId: string
}
// 提交Modal任务
export const submitModal = async (params: ModalParams) => {
  return (await request.post('mj/submit/modal', params, {
    customConfig: {
      type: 'mj'
    }
  })) as MJResponse
}

export interface DescribeParams {
  mode: 'RELAX' | 'FAST'
  base64: string // 图片base64,示例值 (data:image/png;base64,xxx)
  notifyHook?: string
  state?: string
}
// 执行Describe操作，提交图生文任务。
export const submitDescribe = async (params: DescribeParams) => {
  return (await request.post('mj/submit/describe', params, {
    customConfig: {
      type: 'mj'
    }
  })) as MJResponse
}
export interface ShortenParams {
  mode: 'RELAX' | 'FAST'
  notifyHook?: string
  prompt: string
  state?: string
}
// 提交Shorten任务
export const submitShorten = async (params: ShortenParams) => {
  return (await request.post('mj/submit/shorten', params, {
    customConfig: {
      type: 'mj'
    }
  })) as MJResponse
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
  return await request.post('mj/submit/face-swap', params, {
    customConfig: {
      type: 'mj'
    }
  })
}

//  指定id查询任务
export const getTaskById = async (id: string) => {
  return await request.get(`mj/query/task/${id}`, {
    customConfig: {
      type: 'mj'
    }
  })
}
//  指定id查询任务 fetch
export const getTaskByIdFetch = async (id: string) => {
  return await request.get(`mj/task/${id}/fetch`, {
    customConfig: {
      type: 'mj'
    }
  })
}
//指定id列表查询任务
export const getTaskListByIds = async (ids: string[]) => {
  return await request.post(
    'mj/task/list-by-condition',
    { ids: ids.join(',') },
    {
      customConfig: {
        type: 'mj'
      }
    }
  )
}
//获取任务图片的seed
export const getSeed = async (id: string) => {
  return await request.get(`mj/task/${id}/image-seed`, {
    customConfig: {
      type: 'mj'
    }
  })
}

export interface TaskListParams {
  current: number
  pageNum: number
  pageSize: number
  status?: 'NOT_START' | 'SUBMITTED' | 'MODAL' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE' | 'CANCEL'
}
export interface TaskListResponse {
  totalNum: number
  records: TaskList[]
}

//查询所有任务
export const getTaskList = async () => {
  const res = await request.post(
    'user/creation/list',
    { current: 1, pageNum: 1, pageSize: 9999999999 },
    {
      customConfig: {
        type: 'user'
      }
    }
  )
  if (res.data) {
    return res.data as TaskListResponse
  }
}

//查询任务队列
export const getTaskQueue = async () => {
  const res = await request.post(
    'user/creation/list',
    { current: 1, pageNum: 1, pageSize: 9999999999, status: 'IN_PROGRESS' },
    {
      customConfig: {
        type: 'user'
      }
    }
  )
  if (res.data) {
    return res.data as TaskListResponse
  }
}

//登陆mjapi
export const MJlogin = async () => {
  const { data } = await request.post('user/login', { account: 'zhenmin.liu@cloud-pioneer.com', password: 'Hello123' })

  if (data) {
    localStorage.setItem('mj_token', data.accessToken)
  }
}
