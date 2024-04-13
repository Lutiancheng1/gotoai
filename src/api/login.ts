// 登陆
import { http } from '@/utils/axios'
type LoginRes = {
  data: {
    token: string
    type: number
    validTo: string
  }
  code: number
  key: string
  msg: string
}
export const login = async ({ username, password }: { username: string; password: string }) => {
  return (await http.post('/User/Login', { name: username, password, type: 1 })) as LoginRes
}

// 获取当前用户App信息
export const getAppInfo = async () => {
  return await http.get('/Dify/UserAppInfo')
}
