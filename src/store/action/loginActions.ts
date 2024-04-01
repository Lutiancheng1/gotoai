import { http } from '@/utils/request'
import { setTokenInfo } from '@/utils/storage'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { saveToken } from '../reducers/login'
import Toast from '@/components/Toast'

/**
 * 登录
 * @param {{ name, password }} values 登录信息
 * @returns tokenInfo
 */

type LoginParams = {
  name: string
  password: string
  type: number
}
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
export const login = createAsyncThunk('login/login', async (params: LoginParams, { dispatch }) => {
  const res = (await http.post('/User/Login', params)) as LoginRes
  if (res.code === -1) return Toast.notify({ type: 'error', message: res.msg })
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  const tokenInfo = res.data
  // 保存 Token 到 Redux 中
  dispatch(saveToken(tokenInfo))
  //  保存 Token 到本地缓存中
  setTokenInfo(tokenInfo)
  return tokenInfo
})
