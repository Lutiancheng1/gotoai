import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
/**
 * 获取用户基本信息
 * @returns thunk
 */
export const getUser = createAsyncThunk('profile/getUser', async () => {
  const res = await http('/user')
  return res.data
})

/**
 * 获取用户详情
 * @returns thunk
 */
export const getUserProfile = createAsyncThunk('profile/getUserProfile', async (username: string) => {
  const res = await http.get('/User?loginName=' + username)
  return res.data
})
