/**
 * Util lib functions
 */

// generate a random string
export function randString(length: number) {
  const str = '0123456789abcdefghijklmnopqrstuvwxyz'
  const size = str.length
  let buf = []
  for (let i = 0; i < length; i++) {
    const rand = Math.random() * size
    buf.push(str.charAt(rand))
  }
  return buf.join('')
}

export function UUID() {
  let d = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// 判断是否是移动设备
export function isMobile() {
  const userAgent = navigator.userAgent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
  return mobileRegex.test(userAgent)
}

// 格式化日期
export function dateFormat(timestamp: number, format: any) {
  if (!timestamp) {
    return ''
  } else if (timestamp < 9680917502) {
    timestamp = timestamp * 1000
  }
  let year, month, day, HH, mm, ss
  let time = new Date(timestamp)
  let timeDate
  year = time.getFullYear() // 年
  month = time.getMonth() + 1 // 月
  day = time.getDate() // 日
  HH = time.getHours() // 时
  mm = time.getMinutes() // 分
  ss = time.getSeconds() // 秒

  month = month < 10 ? '0' + month : month
  day = day < 10 ? '0' + day : day
  HH = HH < 10 ? '0' + HH : HH // 时
  mm = mm < 10 ? '0' + mm : mm // 分
  ss = ss < 10 ? '0' + ss : ss // 秒

  switch (format) {
    case 'yyyy':
      timeDate = String(year)
      break
    case 'yyyy-MM':
      timeDate = year + '-' + month
      break
    case 'yyyy-MM-dd':
      timeDate = year + '-' + month + '-' + day
      break
    case 'yyyy/MM/dd':
      timeDate = year + '/' + month + '/' + day
      break
    case 'yyyy-MM-dd HH:mm:ss':
      timeDate = year + '-' + month + '-' + day + ' ' + HH + ':' + mm + ':' + ss
      break
    case 'HH:mm:ss':
      timeDate = HH + ':' + mm + ':' + ss
      break
    case 'MM':
      timeDate = String(month)
      break
    default:
      timeDate = year + '-' + month + '-' + day + ' ' + HH + ':' + mm + ':' + ss
      break
  }
  return timeDate
}

// 判断数组中是否包含某个元素
export function arrayContains(array: string | any[], value: any, compare: (arg0: any, arg1: any) => any) {
  if (!array) {
    return false
  }

  if (typeof compare !== 'function') {
    compare = function (v1, v2) {
      return v1 === v2
    }
  }
  for (let i = 0; i < array.length; i++) {
    if (compare(array[i], value)) {
      return true
    }
  }
  return false
}

// 删除数组中指定的元素
export function removeArrayItem(array: any[], value: any, compare: (arg0: any, arg1: any) => any) {
  if (typeof compare !== 'function') {
    compare = function (v1, v2) {
      return v1 === v2
    }
  }
  for (let i = 0; i < array.length; i++) {
    if (compare(array[i], value)) {
      array.splice(i, 1)
      break
    }
  }
  return array
}

// 渲染输入的换行符
export function renderInputText(text: string) {
  const replaceRegex = /(\n\r|\r\n|\r|\n)/g
  text = text || ''
  return text.replace(replaceRegex, '<br/>')
}

// 拷贝对象
export function copyObj(origin: any) {
  return JSON.parse(JSON.stringify(origin))
}

export function disabledDate(time: { getTime: () => number }) {
  return time.getTime() < Date.now()
}

// 字符串截取
export function substr(str: string, length: number) {
  let result = ''
  let count = 0

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i)
    const charCode = str.charCodeAt(i)

    // 判断字符是否为中文字符
    if (charCode >= 0x4e00 && charCode <= 0x9fff) {
      // 中文字符算两个字符
      count += 2
    } else {
      count++
    }

    if (count <= length) {
      result += char
    } else {
      result += ' ...'
      break
    }
  }

  return result
}

export function isImage(url: string) {
  const expr = /\.(jpg|jpeg|png|gif|bmp|svg)$/i
  return expr.test(url)
}

export function processContent(content: string) {
  //process img url
  const linkRegex = /(https?:\/\/\S+)/g
  const links = content.match(linkRegex)
  if (links) {
    for (let link of links) {
      if (isImage(link)) {
        const index = content.indexOf(link)
        if (content.substring(index - 1, 2) !== ']') {
          content = content.replace(link, '\n![](' + link + ')\n')
        }
      }
    }
  }

  // 处理引用块
  if (content.indexOf('\n') === -1) {
    return content
  }

  const texts = content.split('\n')
  const lines = []
  for (let txt of texts) {
    lines.push(txt)
    if (txt.startsWith('>')) {
      lines.push('\n')
    }
  }
  return lines.join('\n')
}

export function escapeHTML(html: string) {
  return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
