import { upload } from '@/utils/request'

type ImageUploadParams = {
  file: File
  onProgressCallback: (progress: number) => void
  onSuccessCallback: (res: { id: string }) => void
  onErrorCallback: () => void
}
type ImageUpload = (v: ImageUploadParams, url?: string) => void
export const imageUpload: ImageUpload = ({ file, onProgressCallback, onSuccessCallback, onErrorCallback }, url) => {
  const formData = new FormData()
  formData.append('file', file)
  const onProgress = (e: ProgressEvent) => {
    if (e.lengthComputable) {
      const percent = Math.floor((e.loaded / e.total) * 100)
      onProgressCallback(percent)
    }
  }

  upload(
    {
      xhr: new XMLHttpRequest(),
      data: formData,
      onprogress: onProgress
    },
    url
  )
    .then((res: { id: string }) => {
      onSuccessCallback(res)
    })
    .catch(() => {
      onErrorCallback()
    })
}
