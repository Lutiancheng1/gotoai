import { AsyncThunk, AsyncThunkOptions, AsyncThunkPayloadCreator, configureStore, Dispatch } from '@reduxjs/toolkit'
import loginSlice from './reducers/login'
import profileSlice from './reducers/profile'
import talkSlice from './reducers/talk'
import documentSlice from './reducers/document'
const store = configureStore({
  reducer: {
    loginSlice,
    profileSlice,
    talkSlice,
    documentSlice
  }
})

//  设置getState的类型 为RootState
declare module '@reduxjs/toolkit' {
  type AsyncThunkConfig = {
    state?: unknown
    dispatch?: Dispatch
    extra?: unknown
    rejectValue?: unknown
    serializedErrorType?: unknown
  }

  function createAsyncThunk<
    Returned,
    ThunkArg = void,
    ThunkApiConfig extends AsyncThunkConfig = { state: RootState } // here is the magic line
  >(typePrefix: string, payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>, options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>): AsyncThunk<Returned, ThunkArg, ThunkApiConfig>
}

// 获取store的类型
export type RootState = ReturnType<typeof store.getState>
// 获取dispatch的类型
export type AppDispatch = typeof store.dispatch
export default store
