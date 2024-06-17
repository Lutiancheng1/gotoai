import Toast from '@/components/Toast'
import { videoBaseUrl } from './BaseUrlConfig'

export interface TaskVideoRequest {
  video_subject: string
  video_script?: string
  video_terms?: string | any[] | null
  video_aspect?: '16:9' | '9:16' | '1:1' | null
  video_concat_mode?: 'random' | 'sequential' | null
  video_clip_duration?: number | null
  video_count?: number | null
  video_source?: string | null
  video_materials?: MaterialInfo[] | null
  video_language?: string | null
  voice_name?: string | null
  voice_volume?: number | null
  bgm_type?: string | null
  bgm_file?: string | null
  bgm_volume?: number | null
  subtitle_enabled?: boolean | null
  subtitle_position?: string | null
  font_name?: string | null
  text_fore_color?: string | null
  text_background_color?: string | null
  font_size?: number
  stroke_color?: string | null
  stroke_width?: number
  n_threads?: number | null
  paragraph_number?: number | null
}

export interface TaskResponse {
  status: number
  message?: string
  data: {
    task_id: string
  }
}

export interface HTTPValidationError {
  detail?: ValidationError[]
}

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface MaterialInfo {
  provider?: string
  url?: string
  duration?: number
}
export interface BgmRetrieveResponse {
  status: number
  message?: string
  data: {
    files: {
      file: string
      name: string
      size: number
    }[]
  }
}

export interface BgmUploadResponse {
  status: number
  message?: string
  data: {
    file: string
  }
}

export interface TaskDeletionResponse {
  status: number
  message?: string
  data: {
    combined_videos: string[]
    progress: number
    state: number
    videos: string[]
  }
}
export interface TaskQueryData {
  combined_videos: string[]
  progress: number
  state: number
  videos: string[]
}
export interface TaskQueryResponse {
  status: number
  message?: string
  data: TaskQueryData
}

export interface VideoScriptRequest {
  video_subject?: string
  video_language?: string
  paragraph_number?: number
}

export interface VideoScriptResponse {
  status: number
  message?: string
  data: {
    video_script: string
  }
}

export interface VideoTermsRequest {
  video_subject?: string
  video_script?: string
  amount?: number
}

export interface VideoTermsResponse {
  status: number
  message?: string
  data: {
    video_terms: string[]
  }
}
export const baseUrl = videoBaseUrl
// Generate a short video
export const createVideo = async (requestBody: TaskVideoRequest): Promise<TaskResponse> => {
  const response = await fetch(`${baseUrl}videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
  // 如果响应状态码为422，处理验证错误
  if (response.status === 422) {
    const errorData: HTTPValidationError = await response.json()
    // 可以在这里处理错误，例如记录或者抛出异常
    console.error('Validation error:', errorData)
    Toast.notify({
      type: 'error',
      message: errorData.detail?.[0]?.msg || '', // Add nullish coalescing operator to provide a default value
      duration: 1000
    })
  }
  // 确保响应状态码为200
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = (await response.json()) as TaskResponse
  return data
}

// Query task status
export const getTaskStatus = async (taskId: string): Promise<TaskQueryResponse> => {
  const response = await fetch(`${baseUrl}tasks/${taskId}`, {
    method: 'GET'
  })
  const data = (await response.json()) as TaskQueryResponse
  return data
}

// Delete a generated short video task
export const deleteVideoTask = async (taskId: string): Promise<TaskDeletionResponse> => {
  const response = await fetch(`${baseUrl}tasks/${taskId}`, {
    method: 'DELETE'
  })
  const data = (await response.json()) as TaskDeletionResponse
  return data
}

// Retrieve local BGM files
export const getBgmList = async (): Promise<BgmRetrieveResponse> => {
  const response = await fetch(`${baseUrl}musics`, {
    method: 'GET'
  })
  const data = (await response.json()) as BgmRetrieveResponse
  return data
}
// 上传文件
export const uploadLocalFile = async (formData: FormData) => {
  // const response = await fetch(`${uploadUrl}_stcore/upload_file/03803f2f-014b-4dd0-ad4d-9517f4ff0a19`, {
  //   method: 'put',
  //   body: formData,
  //   mode: 'no-cors'
  // })
  // console.log(response)
}

// Upload the BGM file to the songs directory
export const uploadBgmFile = async (formData: FormData): Promise<BgmUploadResponse> => {
  const response = await fetch(`${baseUrl}musics`, {
    method: 'POST',
    body: formData
  })
  const data = (await response.json()) as BgmUploadResponse
  return data
}

// Stream video
export const streamVideo = async (filePath: string): Promise<Response> => {
  const response = await fetch(`${baseUrl}stream/${filePath}`, {
    method: 'GET'
  })
  return response
}

// Download video
export const downloadVideo = async (filePath: string): Promise<Response> => {
  const response = await fetch(`${baseUrl}download/${filePath}`, {
    method: 'GET'
  })
  return response
}

// Create a script for the video
// 为视频创建脚本
export const generateVideoScript = async (requestBody: VideoScriptRequest): Promise<VideoScriptResponse> => {
  const response = await fetch(`${baseUrl}scripts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
  const data = (await response.json()) as VideoScriptResponse
  return data
}

// Generate video terms based on the video script
// 根据视频脚本生成视频术语
export const generateVideoTerms = async (requestBody: VideoTermsRequest): Promise<VideoTermsResponse> => {
  const response = await fetch(`${baseUrl}terms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
  const data = (await response.json()) as VideoTermsResponse
  return data
}
