import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ChatMessages, GetHistoryFroMenu, HistoryList, MessageInfo, NewQuestion } from '../types'
import { delHistory, saveHistoryList, updateConversitionDetailList, updateCurrentId, updateHistoryList } from '../reducers/talk'
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
export const getHistoryList = createAsyncThunk('talk/getHistoryList', async (params: GetHistoryFroMenu, { dispatch }) => {
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
export const startChat = createAsyncThunk('talk/startChat', async (params: { menu: number; prompt: string; promptId: number }, { dispatch }) => {
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
export const getConversitionDetail = createAsyncThunk('talk/getConversitionDetail', async (id: string | number, { dispatch }) => {
  const res = await http.get(`/Chat/MessageList?chatid=${id}`)
  if (!res.data) return
  return res.data
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
  dispatch(updateConversitionDetailList(params))
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

/**
 * 发送对话消息 new
 * @param {ChatMessages} params
 * @returns thunk
 */
export const addChatMessages = createAsyncThunk('talk/addChatMessages', async (params: ChatMessages, { dispatch }) => {
  const res = await http.post('/Chat/ChatMessages', params)
  console.log(res, 'addChatMessages')
  if (!res.data) return
  return res.data
})
