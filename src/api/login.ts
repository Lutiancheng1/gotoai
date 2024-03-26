import { http } from '@/utils/request'
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
