import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ChatMessages, GetHistoryFroMenu, HistoryList, MessageInfo, NewQuestion } from '../types'
import { delHistory, saveHistoryList, updateConversitionDetailList, updateCurrentId, updateHistoryList, updateScore } from '../reducers/robot'
import { ShartChatResp } from '@/types/app'

export type HisResponse = {
  rows: HistoryList[]
  recordCount: number
  pageCount: number
  pageIndex: number
  ext: null | any // replace 'any' with the actual type if known
  code: number
  key: null | any // replace 'any' with the actual type if known
  msg: null | string
}

/**
 * 获取历史记录
 * @returns thunk
 */
export const getHistoryList = createAsyncThunk('robot/getHistoryList', async (params: GetHistoryFroMenu, { dispatch }) => {
  const res = (await http.post('/Chat/History', params)) as HisResponse
  if (!res.rows) return
  const { recordCount, pageCount, pageIndex, rows } = res
  if (params.page === 1) {
    dispatch(saveHistoryList({ pageCount, pageIndex, recordCount, rows }))
  } else {
    dispatch(updateHistoryList({ pageCount, pageIndex, recordCount, rows }))
  }
})
/**
 * 删除某一条历史记录
 * @param id 历史记录ID
 * @returns thunk
 *
 */
export const delHistoryItem = createAsyncThunk('robot/delHistoryItem', async (id: string | number, { dispatch }) => {
  const res = await http.get(`/Chat/Delete?id=${id}`)
  console.log(res, 'delHistoryItem')
  if (!res.data) return
  dispatch(delHistory(id))
  return res.data
})

/**
 * 创建新会话ID 旧版
 * @returns thunk
 */
export const createChat = createAsyncThunk('robot/createChat', async (params: NewQuestion, { dispatch }) => {
  const res = await http.post('/Chat/Add', params)
  if (!res.data) return
  dispatch(updateCurrentId(res.data))
  return res.data
})

/**
 * 创建新会话ID 新版
 * @returns thunk
 */
export const startChat = createAsyncThunk('robot/startChat', async (params: { menu: number; prompt: string; promptId: number; fileId?: string }, { dispatch }) => {
  const res = (await http.post('/Chat/StartChat', params)) as { data: ShartChatResp }
  console.log(res, 'startChat')
  if (!res.data) return
  dispatch(updateCurrentId(res.data))
  return res.data
})

/**
 * 获取会话详情
 * @returns thunk
 */
export const getConversitionDetail = createAsyncThunk('robot/getConversitionDetail', async (id: string | number, { dispatch }) => {
  const res = await http.get(`/Chat/MessageList?chatid=${id}`)
  if (!res.data) return
  return res.data
})

/**
 * 向消息列表新增消息记录
 * @param {MessageInfo} params
 * @returns thunk
 */
export const addMessages = createAsyncThunk('robot/addMessages', async (params: MessageInfo, { dispatch }) => {
  const res = await http.post('/Chat/AddMessages', params)
  console.log(res, 'addMessages')
  if (!res.data) return
  dispatch(updateConversitionDetailList(params))
  return res.data
})

/**
 * 更新对话标题
 * @returns thunk
 */
export const updateConversitionTitle = createAsyncThunk('robot/updateConversitionTitle', async (params: { conversationId: string; chatId: string; title: string }, { dispatch }) => {
  const res = await http.post('/Chat/UpdateChatTitle', params)
  console.log(res, 'updateConversitionTitle')
  if (!res.data) return
  return res.data
})

export interface AddChatMessagesData {
  conversationId: string
  message: string
  isCompleted: boolean
  thridChatId?: any
  files: {
    id: number
    chatMessageId: number
    type: string
    url: string
    mimetype: string
  }[]
}

/**
 * 发送对话消息 new
 * @param {ChatMessages} params
 * @returns thunk
 */
export const addChatMessages = createAsyncThunk('robot/addChatMessages', async (params: ChatMessages, { dispatch }) => {
  const res = await http.post('/Chat/ChatMessages', params)
  console.log(res, 'addChatMessages')
  if (!res.data) return
  return res.data as AddChatMessagesData
})

type AddScoreParams = {
  messageId: string | number
  score: 'bad' | 'good'
  tags?: string
}
// 添加点赞/点踩
export const AddScore = createAsyncThunk('talk/AddScore', async (params: AddScoreParams, { dispatch }) => {
  const res = await http.post('/Chat/AddScore', params)
  console.log(res, 'AddScore')
  dispatch(updateScore({ messageId: params.messageId, score: params.score }))
  if (!res.data) return
  return res.data
})

// 取消点赞/点踩
export const CancelScore = createAsyncThunk('talk/DelScore', async (messageId: string | number, { dispatch }) => {
  const res = await http.get(`/Chat/DelScore?msgId=${messageId}`)
  console.log(res, 'CancelScore')
  dispatch(updateScore({ messageId, score: null }))
  if (!res.data) return
  return res.data
})
