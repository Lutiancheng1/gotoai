import Toast from '@/components/Toast'
import {
  AnnotationReply,
  IterationFinishedResponse,
  IterationNextedResponse,
  IterationStartedResponse,
  MessageEnd,
  MessageReplace,
  NodeFinishedResponse,
  NodeStartedResponse,
  TextChunkResponse,
  TextReplaceResponse,
  ThoughtItem,
  VisionFile,
  WorkflowFinishedResponse,
  WorkflowStartedResponse
} from '@/types/app'
const TIME_OUT = 10000
// const BASE_URL = getDifyInfo().apiUrl || 'http://admin.gotoai.world/v1'
// const BASE_URL = 'https://admin.gotoai.world/v1'
// const BASE_URL = 'https://ai.megameta.cn/api'
const BASE_URL = process.env.REACT_APP_KNOWLEDGE_BASE_URL // 知识库的请求地址

// let token = hasDifyInfo() && getDifyInfo().apikey
// let token = 'app-kY76EflnhU20hspLVuOOLPGq'
let token = 'app-8V2dKSV2QgCqQCuI7RXOHgaE'
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
export type IOnDataMoreInfo = {
  conversationId?: string
  taskId?: string
  messageId: string
  errorMessage?: string
  errorCode?: string
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnThought = (though: ThoughtItem) => void
export type IOnFile = (file: VisionFile) => void
export type IOnMessageEnd = (messageEnd: MessageEnd) => void
export type IOnMessageReplace = (messageReplace: MessageReplace) => void
export type IOnAnnotationReply = (messageReplace: AnnotationReply) => void
export type IOnCompleted = (hasError?: boolean, errorMessage?: string) => void
export type IOnError = (msg: string, code?: string) => void

export type IOnWorkflowStarted = (workflowStarted: WorkflowStartedResponse) => void
export type IOnWorkflowFinished = (workflowFinished: WorkflowFinishedResponse) => void
export type IOnNodeStarted = (nodeStarted: NodeStartedResponse) => void
export type IOnNodeFinished = (nodeFinished: NodeFinishedResponse) => void
export type IOnIterationStarted = (workflowStarted: IterationStartedResponse) => void
export type IOnIterationNexted = (workflowStarted: IterationNextedResponse) => void
export type IOnIterationFinished = (workflowFinished: IterationFinishedResponse) => void
export type IOnTextChunk = (textChunk: TextChunkResponse) => void
export type IOnTextReplace = (textReplace: TextReplaceResponse) => void

type ResponseError = {
  code: string
  message: string
  status: number
}

export type IOtherOptions = {
  isPublicAPI?: boolean
  bodyStringify?: boolean
  needAllResponseContent?: boolean
  deleteContentType?: boolean
  silent?: boolean
  onData?: IOnData // for stream
  onThought?: IOnThought
  onFile?: IOnFile
  onMessageEnd?: IOnMessageEnd
  onMessageReplace?: IOnMessageReplace
  onError?: IOnError
  onCompleted?: IOnCompleted // for stream
  getAbortController?: (abortController: AbortController) => void

  onWorkflowStarted?: IOnWorkflowStarted
  onWorkflowFinished?: IOnWorkflowFinished
  onNodeStarted?: IOnNodeStarted
  onNodeFinished?: IOnNodeFinished
  onIterationStart?: IOnIterationStarted
  onIterationNext?: IOnIterationNexted
  onIterationFinish?: IOnIterationFinished
  onTextChunk?: IOnTextChunk
  onTextReplace?: IOnTextReplace
}
function unicodeToChar(text: string) {
  if (!text) return ''

  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  })
}

export function format(text: string) {
  let res = text.trim()
  if (res.startsWith('\n')) res = res.replace('\n', '')

  return res.replaceAll('\n', '<br/>').replaceAll('```', '')
}

const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
  onThought?: IOnThought,
  onMessageEnd?: IOnMessageEnd,
  onMessageReplace?: IOnMessageReplace,
  onFile?: IOnFile,
  onWorkflowStarted?: IOnWorkflowStarted,
  onWorkflowFinished?: IOnWorkflowFinished,
  onNodeStarted?: IOnNodeStarted,
  onNodeFinished?: IOnNodeFinished,
  onIterationStart?: IOnIterationStarted,
  onIterationNext?: IOnIterationNexted,
  onIterationFinish?: IOnIterationFinished,
  onTextChunk?: IOnTextChunk,
  onTextReplace?: IOnTextReplace
) => {
  if (!response.ok) throw new Error('Network response was not ok')

  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let bufferObj: Record<string, any>
  let isFirstMessage = true
  function read() {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted && onCompleted()
        return
      }
      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')
      try {
        lines.forEach((message) => {
          if (message.startsWith('data: ')) {
            // check if it starts with data:
            try {
              bufferObj = JSON.parse(message.substring(6)) as Record<string, any> // remove data: and parse as json
            } catch (e) {
              // mute handle message cut off
              onData('', isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id
              })
              return
            }
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData('', false, {
                conversationId: undefined,
                messageId: '',
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code
              })
              hasError = true
              onCompleted?.(true, bufferObj?.message)
              return
            }
            if (bufferObj.event === 'message' || bufferObj.event === 'agent_message') {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id
              })
              isFirstMessage = false
            } else if (bufferObj.event === 'agent_thought') {
              onThought?.(bufferObj as ThoughtItem)
            } else if (bufferObj.event === 'message_file') {
              onFile?.(bufferObj as VisionFile)
            } else if (bufferObj.event === 'message_end') {
              onMessageEnd?.(bufferObj as MessageEnd)
            } else if (bufferObj.event === 'message_replace') {
              onMessageReplace?.(bufferObj as MessageReplace)
            } else if (bufferObj.event === 'workflow_started') {
              onWorkflowStarted?.(bufferObj as WorkflowStartedResponse)
            } else if (bufferObj.event === 'workflow_finished') {
              onWorkflowFinished?.(bufferObj as WorkflowFinishedResponse)
            } else if (bufferObj.event === 'node_started') {
              onNodeStarted?.(bufferObj as NodeStartedResponse)
            } else if (bufferObj.event === 'node_finished') {
              onNodeFinished?.(bufferObj as NodeFinishedResponse)
            } else if (bufferObj.event === 'iteration_started') {
              onIterationStart?.(bufferObj as IterationStartedResponse)
            } else if (bufferObj.event === 'iteration_next') {
              onIterationNext?.(bufferObj as IterationNextedResponse)
            } else if (bufferObj.event === 'iteration_completed') {
              onIterationFinish?.(bufferObj as IterationFinishedResponse)
            } else if (bufferObj.event === 'text_chunk') {
              onTextChunk?.(bufferObj as TextChunkResponse)
            } else if (bufferObj.event === 'text_replace') {
              onTextReplace?.(bufferObj as TextReplaceResponse)
            }
          }
        })
        buffer = lines[lines.length - 1]
      } catch (e) {
        onData('', false, {
          conversationId: undefined,
          messageId: '',
          errorMessage: `${e}`
        })
        hasError = true
        onCompleted?.(true, e as string)
        return
      }
      if (!hasError) read()
    })
  }
  read()
}

const baseFetch = <T>(url: string, fetchOptions: FetchOptionType, { bodyStringify = true, needAllResponseContent, deleteContentType, getAbortController }: IOtherOptions): Promise<T> => {
  const options: typeof baseOptions & FetchOptionType = Object.assign({}, baseOptions, fetchOptions)
  if (getAbortController) {
    const abortController = new AbortController()
    getAbortController(abortController)
    options.signal = abortController.signal
  }
  options.headers.set('Authorization', `Bearer ${token}`)

  if (deleteContentType) {
    options.headers.delete('Content-Type')
  } else {
    const contentType = options.headers.get('Content-Type')
    if (!contentType) options.headers.set('Content-Type', ContentType.json)
  }

  const urlPrefix = BASE_URL
  let urlWithPrefix = `${urlPrefix}${url.startsWith('/') ? url : `/${url}`}`

  const { method, params, body } = options
  // handle query
  if (method === 'GET' && params) {
    const paramsArray: string[] = []
    Object.keys(params).forEach((key) => paramsArray.push(`${key}=${encodeURIComponent(params[key])}`))
    if (urlWithPrefix.search(/\?/) === -1) urlWithPrefix += `?${paramsArray.join('&')}`
    else urlWithPrefix += `&${paramsArray.join('&')}`

    delete options.params
  }

  if (body && bodyStringify) options.body = JSON.stringify(body)

  // Handle timeout
  return Promise.race([
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('request timeout'))
      }, TIME_OUT)
    }),
    new Promise((resolve, reject) => {
      globalThis
        .fetch(urlWithPrefix, options as RequestInit)
        .then((res) => {
          const resClone = res.clone()
          // Error handler
          if (!/^(2|3)\d{2}$/.test(String(res.status))) {
            const bodyJson = res.json()
            switch (res.status) {
              case 401: {
                return bodyJson.then((data: ResponseError) => {
                  Toast.notify({ type: 'error', message: data.message })
                  return Promise.reject(data)
                })
              }
              case 403:
                bodyJson.then((data: ResponseError) => {
                  Toast.notify({ type: 'error', message: data.message })
                  if (data.code === 'already_setup') globalThis.location.href = `${globalThis.location.origin}/login`
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
export const upload = (options: any, url?: string, searchParams?: string): Promise<any> => {
  const urlPrefix = BASE_URL

  const defaultOptions = {
    method: 'POST',
    url: (url ? `${urlPrefix}${url}` : `${urlPrefix}/files/upload`) + (searchParams || ''),
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: {}
  }
  options = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  }
  return new Promise((resolve, reject) => {
    const xhr = options.xhr
    xhr.open(options.method, options.url)
    for (const key in options.headers) xhr.setRequestHeader(key, options.headers[key])

    xhr.withCredentials = true
    xhr.responseType = 'json'
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 201) resolve(xhr.response)
        else reject(xhr)
      }
    }
    xhr.upload.onprogress = options.onprogress
    xhr.send(options.data)
  })
}
export const ssePost = (
  url: string,
  fetchOptions: FetchOptionType,
  { onData, onCompleted, onThought, onFile, onMessageEnd, onMessageReplace, onWorkflowStarted, onWorkflowFinished, onNodeStarted, onNodeFinished, onIterationStart, onIterationNext, onIterationFinish, onTextChunk, onTextReplace, onError, getAbortController }: IOtherOptions
) => {
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
  options.headers.set('Authorization', `Bearer ${token}`)
  const contentType = options.headers.get('Content-Type')
  if (!contentType) options.headers.set('Content-Type', ContentType.json)

  getAbortController?.(abortController)

  const urlPrefix = BASE_URL
  const urlWithPrefix = `${urlPrefix}${url.startsWith('/') ? url : `/${url}`}`

  const { body } = options
  if (body) options.body = JSON.stringify(body)

  globalThis
    .fetch(urlWithPrefix, options as RequestInit)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        res.json().then((data: any) => {
          Toast.notify({ type: 'error', message: data.message || 'Server Error' })
        })
        onError?.('Server Error')
        return
      }
      return handleStream(
        res,
        (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
          if (moreInfo.errorMessage) {
            onError?.(moreInfo.errorMessage, moreInfo.errorCode)
            if (moreInfo.errorMessage !== 'AbortError: The user aborted a request.') Toast.notify({ type: 'error', message: moreInfo.errorMessage })
            return
          }
          onData?.(str, isFirstMessage, moreInfo)
        },
        onCompleted,
        onThought,
        onMessageEnd,
        onMessageReplace,
        onFile,
        onWorkflowStarted,
        onWorkflowFinished,
        onNodeStarted,
        onNodeFinished,
        onIterationStart,
        onIterationNext,
        onIterationFinish,
        onTextChunk,
        onTextReplace
      )
    })
    .catch((e) => {
      if (e.toString() !== 'AbortError: The user aborted a request.') Toast.notify({ type: 'error', message: e })
      onError?.(e)
    })
}

// base request
export const request = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return baseFetch<T>(url, options, otherOptions || {})
}

// request methods
export const get = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request<T>(url, Object.assign({}, options, { method: 'GET' }), otherOptions)
}

export const post = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request<T>(url, Object.assign({}, options, { method: 'POST' }), otherOptions)
}

export const put = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request<T>(url, Object.assign({}, options, { method: 'PUT' }), otherOptions)
}

export const del = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request<T>(url, Object.assign({}, options, { method: 'DELETE' }), otherOptions)
}

export const patch = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request<T>(url, Object.assign({}, options, { method: 'PATCH' }), otherOptions)
}
