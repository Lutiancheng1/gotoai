/*
* Formats a number with comma separators.
 formatNumber(1234567) will return '1,234,567'
 formatNumber(1234567.89) will return '1,234,567.89'
*/
export const formatNumber = (num: number | string) => {
  if (!num) return num
  const parts = num.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export const formatFileSize = (num: number) => {
  if (!num) return num
  const units = ['', 'K', 'M', 'G', 'T', 'P']
  let index = 0
  while (num >= 1024 && index < units.length) {
    num = num / 1024
    index++
  }
  return `${num.toFixed(2)}${units[index]}B`
}

export const formatTime = (num: number) => {
  if (!num) return num
  const units = ['sec', 'min', 'h']
  let index = 0
  while (num >= 60 && index < units.length) {
    num = num / 60
    index++
  }
  return `${num.toFixed(2)} ${units[index]}`
}
export function formatFileType(mimeType: string): string {
  const typeMap: { [key: string]: string } = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word (docx)',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel (xlsx)',
    'text/csv': 'CSV',
    'image/jpeg': 'JPEG 图片',
    'image/png': 'PNG 图片',
    'image/gif': 'GIF 图片',
    'text/plain': '文本文件',
    'application/zip': 'ZIP 压缩文件',
    'application/x-rar-compressed': 'RAR 压缩文件',
    'application/x-7z-compressed': '7z 压缩文件',
    'video/mp4': 'MP4 视频',
    'audio/mpeg': 'MP3 音频',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint (pptx)',
    'application/x-msdownload': '可执行文件',
    'application/json': 'JSON 文件',
    'application/xml': 'XML 文件',
    'text/html': 'HTML 文件'
    // 更多文件类型...
  }

  return typeMap[mimeType] || '未知格式'
}

// 解析Uint8Array 转为json 返回
export const parsePack = (str: string) => {
  // 定义正则表达式匹配模式
  const pattern = /data:\s*({.*?})\s*\n/g
  // 定义一个数组来存储所有匹 配到的 JSON 对象
  const result = []
  // 使用正则表达式匹配完整的 JSON 对象并解析它们
  let match
  while ((match = pattern.exec(str)) !== null) {
    const jsonStr = match[1]
    try {
      const json = JSON.parse(jsonStr)
      result.push(json)
    } catch (e) {
      console.log(e)
    }
  }
  // 输出所有解析出的 JSON 对象
  return result
}

// 打字机队列
export class Typewriter {
  private queue: string[] = []
  private consuming = false
  private timmer: any
  constructor(private onConsume: (str: string) => void) {}
  // 输出速度动态控制
  dynamicSpeed() {
    const speed = 2000 / this.queue.length
    if (speed > 200) {
      return 200
    } else {
      return speed
    }
  }
  // 添加字符串到队列
  add(str: string) {
    if (!str) return
    this.queue.push(...str.split(''))
  }
  // 消费
  consume() {
    if (this.queue.length > 0) {
      const str = this.queue.shift()
      str && this.onConsume(str)
    }
  }
  // 消费下一个
  next() {
    this.consume()
    // 根据队列中字符的数量来设置消耗每一帧的速度，用定时器消耗
    this.timmer = setTimeout(() => {
      this.consume()
      if (this.consuming) {
        this.next()
      }
    }, this.dynamicSpeed())
  }
  // 开始消费队列
  start() {
    this.consuming = true
    this.next()
  }
  // 结束消费队列
  done() {
    this.consuming = false
    clearTimeout(this.timmer)
    // 把queue中剩下的字符一次性消费
    this.onConsume(this.queue.join(''))
    this.queue = []
  }
}
