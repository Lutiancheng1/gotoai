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
