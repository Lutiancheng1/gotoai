import { getTokenInfo, removeTokenInfo } from '@/utils/storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Token } from '../types'

const initialState: Token = {
  token: getTokenInfo().token,
  type: getTokenInfo().type,
  validTo: getTokenInfo().validTo
  // refresh_token: getTokenInfo().refresh_token
}

const LoginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    // 保存token
    saveToken(state, { payload }: PayloadAction<Token>) {
      state.token = payload.token
      // state.refresh_token = payload.refresh_token
    },
    // 退出登录
    logOut: (state) => {
      removeTokenInfo()
      state = {} as Token
    }
  }
  // extraReducers: {}
})

export const { saveToken, logOut } = LoginSlice.actions

export default LoginSlice.reducer
