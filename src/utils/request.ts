import Toast from '@/components/toast'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { getTokenInfo } from './storage'
const TIME_OUT = 10000
const ContentType = {
  json: 'application/json',
  stream: 'text/event-stream',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  download: 'application/octet-stream', // for download
  upload: 'multipart/form-data' // for upload
}

const baseOptions = {
  method: 'GET',
  mode: 'cors',
  credentials: 'include', // always send cookies、HTTP Basic authentication.
  headers: new Headers({
    'Content-Type': ContentType.json
  }),
  redirect: 'follow'
}
type FetchOptionType = Omit<RequestInit, 'body'> & {
  params?: Record<string, any>
  body?: BodyInit | Record<string, any> | null
}
// export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
// export type IOnThought = (though: ThoughtItem) => void
// export type IOnFile = (file: VisionFile) => void
// export type IOnMessageEnd = (messageEnd: MessageEnd) => void
// export type IOnMessageReplace = (messageReplace: MessageReplace) => void
// export type IOnAnnotationReply = (messageReplace: AnnotationReply) => void
export type IOnCompleted = (hasError?: boolean) => void
export type IOnError = (msg: string, code?: string) => void

type ResponseError = {
  code: string
  message: string
  status: number
}
type IOtherOptions = {
  bodyStringify?: boolean
  needAllResponseContent?: boolean
  deleteContentType?: boolean
  // onData?: IOnData // for stream
  // onThought?: IOnThought
  // onFile?: IOnFile
  // onMessageEnd?: IOnMessageEnd
  // onMessageReplace?: IOnMessageReplace
  onError?: IOnError
  onCompleted?: IOnCompleted // for stream
  getAbortController?: (abortController: AbortController) => void
}

const baseFetch = <T>(url: string, fetchOptions: FetchOptionType, { bodyStringify = true, needAllResponseContent, deleteContentType, getAbortController }: IOtherOptions): Promise<T> => {
  const options: typeof baseOptions & FetchOptionType = Object.assign({}, baseOptions, fetchOptions)
  console.log(options)

  if (getAbortController) {
    const abortController = new AbortController()
    getAbortController(abortController)
    options.signal = abortController.signal
  }
  const accessToken = localStorage.getItem('console_token') || ''
  options.headers.set('Authorization', `Bearer ${accessToken}`)

  if (deleteContentType) {
    options.headers.delete('Content-Type')
  } else {
    const contentType = options.headers.get('Content-Type')
    if (!contentType) options.headers.set('Content-Type', ContentType.json)
  }

  const { method, params, body } = options
  // handle query
  if (method === 'GET' && params) {
    const paramsArray: string[] = []
    Object.keys(params).forEach((key) => paramsArray.push(`${key}=${encodeURIComponent(params[key])}`))

    delete options.params
  }

  if (body && bodyStringify) options.body = JSON.stringify(body)

  // Handle timeout
  return Promise.race([
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(Toast.notify({ type: 'error', message: '超时' }))
      }, TIME_OUT)
    }),
    new Promise((resolve, reject) => {
      globalThis
        .fetch(url, options as RequestInit)
        .then((res) => {
          const resClone = res.clone()
          // Error handler
          if (!/^(2|3)\d{2}$/.test(String(res.status))) {
            const bodyJson = res.json()
            switch (res.status) {
              case 401: {
                const loginUrl = `${globalThis.location.origin}/login`
                bodyJson
                  .then((data: ResponseError) => {
                    Toast.notify({ type: 'error', message: data.message })
                  })
                  .catch(() => {
                    // Handle any other errors
                    globalThis.location.href = loginUrl
                  })

                break
              }
              case 403:
                bodyJson.then((data: ResponseError) => {
                  Toast.notify({ type: 'error', message: data.message })
                  if (data.code === 'already_setup') globalThis.location.href = `${globalThis.location.origin}/signin`
                })
                break
              // fall through
              default:
                bodyJson.then((data: ResponseError) => {
                  Toast.notify({ type: 'error', message: data.message })
                })
            }
            return Promise.reject(resClone)
          }

          // handle delete api. Delete api not return content.
          if (res.status === 204) {
            resolve({ result: 'success' })
            return
          }

          // return data
          const data: Promise<T> = options.headers.get('Content-type') === ContentType.download ? res.blob() : res.json()

          resolve(needAllResponseContent ? resClone : data)
        })
        .catch((err) => {
          Toast.notify({ type: 'error', message: err })

          reject(err)
        })
    })
  ]) as Promise<T>
}

export const ssePost = (url: string, fetchOptions: FetchOptionType) => {
  const abortController = new AbortController()

  const options = Object.assign(
    {},
    baseOptions,
    {
      method: 'POST',
      signal: abortController.signal
    },
    fetchOptions
  )

  const contentType = options.headers.get('Content-Type')
  if (!contentType) options.headers.set('Content-Type', ContentType.json)

  // getAbortController?.(abortController)

  const { body } = options
  if (body) options.body = JSON.stringify(body)

  globalThis
    .fetch(url, options as RequestInit)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        res.json().then((data: any) => {
          Toast.notify({ type: 'error', message: data.message || 'Server Error' })
        })
        return
      }
    })
    .catch((e) => {
      if (e) Toast.notify({ type: 'error', message: e })
    })
}
// base request
export const request = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return baseFetch<T>(url, options, otherOptions || {})
}

export const http = axios.create({
  timeout: 10000,
  baseURL: process.env.REACT_APP_BASE_URL
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
    return response.data
  },
  async (error: AxiosError<{ message: string }>) => {
    if (!error.response) {
      // 如果因为网络原因 请求超时没有response
      Toast.notify({ type: 'error', message: '网络错误' })
      return Promise.reject(error)
    }
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
