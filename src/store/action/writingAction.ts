// 营销创意
import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Toast from '@/components/Toast'
import { updateWishList } from '../reducers/writing'
export interface WritingDetailList {
  id: number
  marketingId: number
  title: string
  input_name: string
  controlType: string
  max_size: number
  placeholder: string
  defaultValue: string
  err_msg: string
  options?: string
  loading_text?: string
  accept: string
  btn_text?: string
  sorts: number
  input_type: string
  default: string[]
  option: string[]
}

export interface WritingChildrenList {
  id: number
  categoryId: number
  nickname: string
  icon: string
  description: string
  chat_type: number
  status: number
  prompt: string
  isHot: number
  is_wish: 0 | 1
  query: string
  list: WritingDetailList[]
  extra?: {
    title_left: string
    title_right: string
  }
}

export type WritingCategory = {
  list: WritingChildrenList[]
  id: number
  name: string
  title: string
  icon: string
  icon_hover: string
  icon_small: string
  status: number
  sorts: number
  desc: string
  isSystem: number
  isExpanded: boolean
}
export type WritingCategoryRes = {
  code: number
  msg: string
  data: WritingCategory[]
}

/**
 * 获取营销创意种类列表
 * @returns {Promise<void | WritingCategory[]>} - 返回一个promise，resolve的值为营销创意种类列表
 */
export const getWritingCategoryList = createAsyncThunk('/WritingCategory/List', async (): Promise<void | WritingCategory[]> => {
  const res = (await http.get('/WritingCategory/List')) as WritingCategoryRes
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 获取分类详情
 * @param {number} id - 分类的id
 * @returns {Promise<void | WritingChildrenList>} - 返回一个promise，resolve的值为分类详情
 */
export const getWritingDetail = createAsyncThunk('/Writing', async (id: number): Promise<void | WritingChildrenList> => {
  const res = (await http.get('/Writing?id=' + id)) as { data: WritingChildrenList; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 添加收藏
 * @param {WritingChildrenList} item - 分类信息
 * @param {object} { dispatch } - thunk API
 * @returns {Promise<void | boolean>} - 返回一个promise，resolve的值为添加成功与否
 */
export const addWish = createAsyncThunk('/Writing/AddWish', async (item: WritingChildrenList, { dispatch }): Promise<void | boolean> => {
  const res = (await http.get('/Writing/AddWish?marketingId=' + item.id)) as { data: boolean; code: number; msg: string }
  if (!res.data && res.code !== 0) return Toast.notify({ type: 'error', message: res.msg })
  await dispatch(
    updateWishList({
      category: item,
      is_wish: 0
    })
  )
  Toast.notify({ type: 'success', message: '收藏成功' })
})

/**
 * 获取收藏
 * @returns {Promise<void | WritingChildrenList[]>} - 返回一个promise，resolve的值为收藏列表
 */
export const getWishList = createAsyncThunk('/Writing/WishList', async (): Promise<void | WritingChildrenList[]> => {
  const res = (await http.get('/Writing/WishList')) as { data: WritingChildrenList[]; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 删除收藏
 * @param {WritingChildrenList} item - 分类信息
 * @param {object} { dispatch } - thunk API
 * @returns {Promise<void | boolean>} - 返回一个promise，resolve的值为删除成功与否
 */
export const deleteWish = createAsyncThunk('/Writing/DeleteWish', async (item: WritingChildrenList, { dispatch }): Promise<void | boolean> => {
  const res = (await http.get('/Writing/DeleteWish?marketingId=' + item.id)) as { data: boolean; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  await dispatch(
    updateWishList({
      category: item,
      is_wish: 1
    })
  )
  Toast.notify({ type: 'success', message: '取消收藏成功' })
})

/**
 * 获取最近使用
 * @returns {Promise<void | WritingChildrenList[]>} - 返回一个promise，resolve的值为最近使用列表
 */
export const getHistoryList = createAsyncThunk('/Writing/HistoryList', async (): Promise<void | WritingChildrenList[]> => {
  const res = (await http.get('/Writing/HistoryList')) as { data: WritingChildrenList[]; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})
