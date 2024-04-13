import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HistoryList, MessageInfo } from '../types'
import { createChat, getConversitionDetail, getHistoryList, startChat } from '../action/talkActions'
import { ShartChatResp } from '@/types/app'
export type HistoryState = {
  rows: HistoryList[]
  recordCount: number
  pageCount: number
  pageIndex: number
  empty?: boolean
}
export type talkInitialState = {
  historyList: HistoryState
  // 当前会话id
  currentConversation: {
    conversationId: string
    chatId: number
  }
  conversitionDetailList: MessageInfo[]
  loading: boolean
  isNewChat: boolean
  // 记录是否第一次发送
  firstSend: boolean
}
const initialState = {
  // 历史记录list
  historyList: {
    recordCount: 0,
    pageCount: 0,
    pageIndex: 0,
    rows: [],
    empty: true
  },
  // 当前会话id
  currentConversation: {
    conversationId: '',
    chatId: 0
  },
  //当前回话历史消息
  conversitionDetailList: [],
  loading: false,
  // 是否是新对话
  isNewChat: false,
  firstSend: true
} as talkInitialState

const talkSlice = createSlice({
  name: 'talk',
  initialState,
  reducers: {
    // 数据同步到本地
    // 更新loading状态
    updateLoading(state, { payload }: PayloadAction<boolean>) {
      state.loading = payload
    },
    // 更新currentId
    updateCurrentId(state, { payload }: PayloadAction<ShartChatResp>) {
      state.currentConversation = payload
    },
    // 更新当前会话历史
    updateConversitionDetailList(state, { payload }: PayloadAction<MessageInfo[]>) {
      state.conversitionDetailList = [...state.conversitionDetailList, ...payload]
    },
    // 清空历史记录列表
    clearHistoryList(state) {
      state.historyList.rows = []
    },
    // 清空会话历史
    clearConversitionDetailList(state) {
      state.conversitionDetailList = []
    },
    // 删除某条历史记录
    delHistory(state, { payload }: PayloadAction<string | number>) {
      state.historyList.rows = state.historyList.rows.filter((item) => item.id !== payload)
    },
    //切换是否是新对话
    toggleIsNewChat(state, { payload }: PayloadAction<boolean>) {
      state.isNewChat = payload
    },
    // 保存列表历史记录 覆盖
    saveHistoryList(state, { payload }: PayloadAction<HistoryState>) {
      state.historyList.rows = payload.rows
      state.historyList.recordCount = payload.recordCount
      state.historyList.pageCount = payload.pageCount
      state.historyList.pageIndex = payload.pageIndex
      state.historyList.empty = false
    },
    // 更新历史记录 叠加
    updateHistoryList(state, { payload }: PayloadAction<HistoryState>) {
      state.historyList.rows = [...state.historyList.rows, ...payload.rows]
      state.historyList.recordCount = payload.recordCount
      state.historyList.pageCount = payload.pageCount
      state.historyList.pageIndex = payload.pageIndex
      state.historyList.empty = false
    },
    // 重置是否第一次发送
    toggleFirstSend(state, { payload }: PayloadAction<boolean>) {
      state.firstSend = payload
    },

    //初始化state
    initState(state) {
      state.historyList = {
        recordCount: 0,
        pageCount: 0,
        pageIndex: 0,
        rows: [],
        empty: true
      }
      state.currentConversation = {
        conversationId: '',
        chatId: 0
      }
      state.conversitionDetailList = []
      state.loading = false
      state.isNewChat = true
      state.firstSend = true
    }
  },

  extraReducers(builder) {
    // 历史记录拿去成功后保存
    // builder.addCase(getHistoryList.fulfilled, (state, { payload }) => {
    //   state.historyList = payload as {
    //     rows: HistoryList
    //     recordCount: number
    //     pageCount: number
    //     pageIndex: number
    //   }
    // })

    // 获取会话详情
    builder.addCase(getConversitionDetail.fulfilled, (state, { payload }) => {
      state.conversitionDetailList = payload as unknown as MessageInfo[]
    })
  }
})

export const { updateCurrentId, updateConversitionDetailList, delHistory, updateLoading, clearConversitionDetailList, initState, toggleIsNewChat, updateHistoryList, clearHistoryList, saveHistoryList, toggleFirstSend } = talkSlice.actions
export default talkSlice.reducer
