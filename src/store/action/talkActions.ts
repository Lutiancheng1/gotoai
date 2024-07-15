import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ChatMessages, GetHistoryFroMenu, HistoryList, MessageInfo, NewQuestion } from '../types'
import { delHistory, saveHistoryList, updateConversitionDetailList, updateCurrentId, updateHistoryList, updateScore } from '../reducers/talk'
import { ShartChatResp } from '@/types/app'
import { FileInfo } from '@/components/Dialogue'
import { AxiosResponse } from 'axios'

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
export const getHistoryList = createAsyncThunk('talk/getHistoryList', async (params: GetHistoryFroMenu, { dispatch }) => {
  const res = (await http.post('/Chat/History', params)) as HisResponse
  if (!res.rows) return
  const { recordCount, pageCount, pageIndex, rows } = res
  if (params.page === 1) {
    dispatch(saveHistoryList({ pageCount, pageIndex, recordCount, rows }))
  } else {
    dispatch(updateHistoryList({ pageCount, pageIndex, recordCount, rows }))
  }
  return rows
})
/**
 * 删除某一条历史记录
 * @param id 历史记录ID
 * @returns thunk
 *
 */
export const delHistoryItem = createAsyncThunk('talk/delHistoryItem', async (id: string | number, { dispatch }) => {
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
export const createChat = createAsyncThunk('talk/createChat', async (params: NewQuestion, { dispatch }) => {
  const res = await http.post('/Chat/Add', params)
  if (!res.data) return
  dispatch(updateCurrentId(res.data))
  return res.data
})

/**
 * 创建新会话ID 新版
 * @returns thunk
 */
export const startChat = createAsyncThunk('talk/startChat', async (params: { menu: number; prompt: string; promptId: number; fileId?: string }, { dispatch }) => {
  const res = (await http.post('/Chat/StartChat', params)) as { code: number; data: ShartChatResp }
  console.log(res, 'startChat')
  if (res.code !== 0 && !res.data) return
  dispatch(updateCurrentId(res.data))
  return res.data
})

/**
 * 获取会话详情
 * @returns thunk
 */
export const getConversitionDetail = createAsyncThunk('talk/getConversitionDetail', async (id: string | number): Promise<MessageInfo[] | void> => {
  const res = await http.get(`/Chat/MessageList?chatid=${id}`)
  if (!res.data) return
  return res.data as MessageInfo[]
})

/**
 * 向消息列表新增消息记录
 * @param {MessageInfo} params
 * @returns thunk
 */
export const addMessages = createAsyncThunk('talk/addMessages', async (params: MessageInfo[], { dispatch }) => {
  const res = await http.post('/Chat/AddMessages', params)
  console.log(res, 'addMessages')
  if (!res.data) return
  return res.data
})

/**
 * 更新会话标题
 * @param {{ chatId: number; title: string; conversationId: string }} params - 包含 chatId（聊天ID），title（新标题），和 conversationId（会话ID）的对象
 * @returns thunk - 返回一个异步 thunk 动作，用于更新会话标题
 */
export const updateChatTitle = createAsyncThunk('talk/updateChatTitle', async (params: { chatId: number; title: string; conversationId: string }) => {
  const res = await http.post('/Chat/UpdateChatTitle', params)
  console.log(res, 'updateChatTitle')
  if (!res.data) return
  return res.data
})

/**
 * 更新对话标题
 * @returns thunk
 */
export const updateConversitionTitle = createAsyncThunk('talk/updateConversitionTitle', async (params: { conversationId: string; chatId: string; title: string }, { dispatch }) => {
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
export const addChatMessages = createAsyncThunk('talk/addChatMessages', async (params: ChatMessages, { dispatch }) => {
  const res = await http.post('/Chat/ChatMessages', params)
  console.log(res, 'addChatMessages')
  if (!res.data) return
  return res.data as AddChatMessagesData
})

// 获取联想词、提问列表
export const getQuesions = createAsyncThunk('talk/getQuesions', async (conversationId: string) => {
  const res = (await http.get(`/Chat/Questions?conversationId=${conversationId}`)) as { data: string[]; code: number; msg: string }
  console.log(res)
  if (!res.data && res.code !== 0) return
  return res.data as string[]
})

//  创建临时会话id
export const createTempChat = createAsyncThunk('talk/createTempChat', async (menu: number) => {
  const res = (await http.get(`/Chat/ConversationId?menu=${menu}`)) as { data: string; code: number; msg: string }
  console.log(res)
  if (!res.data && res.code !== 0) return
  return res.data
})

//  保存临时会话
export const saveTempChat = createAsyncThunk('talk/saveTempChat', async (params: { conversationId: string; menu: number }) => {
  const res = (await http.get(`/Chat/SaveChat?menu=${params.menu}&conversationId=${params.conversationId}`)) as {
    data: {
      conversationId: string
      chatId: number
    }
    code: number
    msg: string
  }
  console.log(res)
  if (!res.data && res.code !== 0) return
  return res.data
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
  if (!res.data) return
  dispatch(updateScore({ messageId: params.messageId, score: params.score }))
  return res.data
})

// 取消点赞/点踩
export const CancelScore = createAsyncThunk('talk/DelScore', async (messageId: string | number, { dispatch }) => {
  const res = await http.get(`/Chat/DelScore?msgId=${messageId}`)
  console.log(res, 'CancelScore')
  if (!res.data) return
  dispatch(updateScore({ messageId, score: null }))
  return res.data
})
