import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getUserProfile } from '@/store/action/profileActions'
import { User } from '../types'
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    // 用户基本信息
    user: {} as User
  },
  reducers: {
    // 数据同步到本地
  },
  // extraReducers: {
  //   // 成功之后保存用户信息
  //   [getUser.fulfilled](state, { payload }) {
  //     state.user = payload.data
  //   },
  //   // 成功之后保存用户详情信息
  //   [getUserProfile.fulfilled](state, { payload }) {
  //     state.userProfile = payload.data
  //   }
  // }
  extraReducers(builder) {
    // 成功之后保存用户信息
    builder.addCase(getUserProfile.fulfilled, (state, { payload }: PayloadAction<User>) => {
      state.user = payload
    })
  }
})

export const {} = profileSlice.actions
export default profileSlice.reducer
