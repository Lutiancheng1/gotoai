// 营销创意
import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Toast from '@/components/Toast'
import { updateWishList } from '../reducers/creativity'
export interface CategoryDetailList {
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

export interface CategoryChildrenList {
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
  list: CategoryDetailList[]
}

export type MarketingCategory = {
  list: CategoryChildrenList[]
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
export type MarketingCategoryRes = {
  code: number
  msg: string
  data: MarketingCategory[]
}

/**
 * 获取营销创意种类列表
 * @returns {Promise<void | MarketingCategory[]>} - 返回一个promise，resolve的值为营销创意种类列表
 */
export const getMarketingCategoryList = createAsyncThunk('/MarketingCategory/List', async (): Promise<void | MarketingCategory[]> => {
  const res = (await http.get('/MarketingCategory/List')) as MarketingCategoryRes
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 获取分类详情
 * @param {number} id - 分类的id
 * @returns {Promise<void | CategoryChildrenList>} - 返回一个promise，resolve的值为分类详情
 */
export const getCategoryDetail = createAsyncThunk('/Marketing', async (id: number): Promise<void | CategoryChildrenList> => {
  const res = (await http.get('/Marketing?id=' + id)) as { data: CategoryChildrenList; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 添加收藏
 * @param {CategoryChildrenList} item - 分类信息
 * @param {object} { dispatch } - thunk API
 * @returns {Promise<void | boolean>} - 返回一个promise，resolve的值为添加成功与否
 */
export const addWish = createAsyncThunk('/Marketing/AddWish', async (item: CategoryChildrenList, { dispatch }): Promise<void | boolean> => {
  const res = (await http.get('/Marketing/AddWish?marketingId=' + item.id)) as { data: boolean; code: number; msg: string }
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
 * @returns {Promise<void | CategoryChildrenList[]>} - 返回一个promise，resolve的值为收藏列表
 */
export const getWishList = createAsyncThunk('/Marketing/WishList', async (): Promise<void | CategoryChildrenList[]> => {
  const res = (await http.get('/Marketing/WishList')) as { data: CategoryChildrenList[]; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 删除收藏
 * @param {CategoryChildrenList} item - 分类信息
 * @param {object} { dispatch } - thunk API
 * @returns {Promise<void | boolean>} - 返回一个promise，resolve的值为删除成功与否
 */
export const deleteWish = createAsyncThunk('/Marketing/DeleteWish', async (item: CategoryChildrenList, { dispatch }): Promise<void | boolean> => {
  const res = (await http.get('/Marketing/DeleteWish?marketingId=' + item.id)) as { data: boolean; code: number; msg: string }
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
 * @returns {Promise<void | CategoryChildrenList[]>} - 返回一个promise，resolve的值为最近使用列表
 */
export const getHistoryList = createAsyncThunk('/Marketing/HistoryList', async (): Promise<void | CategoryChildrenList[]> => {
  const res = (await http.get('/Marketing/HistoryList')) as { data: CategoryChildrenList[]; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})

/**
 * 搜索种类
 * @param {string} keywold - 搜索关键词
 * @returns {Promise<void | CategoryChildrenList[]>} - 返回一个promise，resolve的值为搜索结果列表
 */
export const getSearchList = createAsyncThunk('/Marketing/SearchData', async (keywold: string): Promise<void | CategoryChildrenList[]> => {
  const res = (await http.post('/Marketing/SearchData', {
    nickname: keywold
  })) as { data: CategoryChildrenList[]; code: number; msg: string }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res.data
})
