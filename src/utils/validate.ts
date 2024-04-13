// 正则校验工具函数

export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validateMobile(mobile: string) {
  const regex = /^1[3456789]\d{9}$/
  return regex.test(mobile)
}
