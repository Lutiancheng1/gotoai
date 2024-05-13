import Toast from '@/components/Toast'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError, CanceledError } from 'axios'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UploadRequestError } from 'rc-upload/lib/interface'
import { http } from '@/utils/axios'

interface UploadResponse {
  url: string
  fileId: string
  chat: { chatId: number; conversationId: string }
}
// 根据文件MIME类型定义允许的格式
export const formatMap: { [key: string]: string[] } = {
  image: ['image/jpeg', 'image/png', 'image/gif'],
  word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  pdf: ['application/pdf'],
  csv: ['text/csv'],
  video: ['video/*']
}
// 修改函数签名以接受成功和失败的回调
export async function uploadFile(
  menu: number,
  file: File,
  signal: AbortSignal, // 从外部传入的signal
  progressCallback: (percentage: number) => void,
  onSuccess: (response: UploadResponse) => void, // 成功回调
  onFailure: (error: string) => void, // 失败回调
  allowedFormats: string[] = [], // 允许的文件格式数组，默认为空，表示允许所有格式
  maxFileSize: number = 10 * 1024 * 1024 // 默认最大文件大小为10MB
): Promise<void> {
  // 如果指定了允许的格式，则进行校验
  if (allowedFormats.length > 0) {
    const allowedMimeTypes = allowedFormats.flatMap((format) => formatMap[format] || [])
    if (!allowedMimeTypes.includes(file.type)) {
      onFailure(`只支持${allowedFormats.join(',')}文件`)
      return
    }
  }
  // 文件大小校验
  if (file.size > maxFileSize) {
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2) // 将文件大小转换为MB，并保留两位小数
    const maxFileSizeInMB = (maxFileSize / (1024 * 1024)).toFixed(2) // 将最大文件大小转换为MB，并保留两位小数
    onFailure(`文件大小超出限制: ${fileSizeInMB} MB. 最大允许: ${maxFileSizeInMB} MB.`)
    return
  }

  const formData = new FormData()
  formData.append('file', file) // 假设后端接收的文件字段名为 'file'

  try {
    const { data, msg } = (await http.post(`/Document/UploadFile?menu=${menu}`, formData, {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
        progressCallback && progressCallback(percentage) // 调用回调函数更新进度
      },
      signal // 传入signal
    })) as { data: UploadResponse; msg: string }

    if (!data) {
      onFailure(msg)
      return
    }
    // 上传成功
    // Toast.notify({ type: 'success', message: '上传成功' })
    onSuccess(data) // 调用成功回调
  } catch (error: AxiosError | CanceledError<UploadRequestError> | any) {
    if (axios.isCancel(error)) {
      Toast.notify({ type: 'info', message: '上传已取消' })
    } else {
      Toast.notify({ type: 'error', message: '上传失败' })
      onFailure(error) // 调用失败回调
    }
  }
}
