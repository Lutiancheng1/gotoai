import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getHistoryList, getWishList, getWritingCategoryList, getWritingDetail, WritingCategory, WritingChildrenList } from '../action/writingAction'

export interface WritingState {
  category: WritingCategory[]
  history: WritingCategory
  wish: WritingCategory
  currentCategory: WritingChildrenList
  pureCategory: WritingCategory[]
}
export const initialState: WritingState = {
  category: [],
  history: {
    id: 0,
    sorts: 0,
    status: 1,
    name: '最近使用',
    desc: '',
    isSystem: 1,
    icon: 'https://cloud.zhaomi.cn/character_robot/icon/history.png',
    icon_hover: 'https://cloud.zhaomi.cn/character_robot/icon/history_blue.png',
    icon_small: 'https://cloud.zhaomi.cn/character_robot/icon/history_small.png',
    list: [],
    title: '最近使用',
    isExpanded: false
  },
  wish: {
    id: 0,
    sorts: 0,
    status: 1,
    name: '我的收藏',
    desc: '',
    isSystem: 1,
    icon: 'https://cloud.zhaomi.cn/character_robot/icon/wish.png',
    icon_hover: 'https://cloud.zhaomi.cn/character_robot/icon/wish_blue.png',
    icon_small: 'https://cloud.zhaomi.cn/character_robot/icon/wish_small.png',
    list: [],
    title: '我的收藏',
    isExpanded: false
  },
  currentCategory: {} as WritingChildrenList,
  pureCategory: [] // 原始数据
}

const creativitySlice = createSlice({
  name: 'writing',
  initialState,
  reducers: {
    // 更新折叠状态
    updateCollapsed(state, action: PayloadAction<{ key: string; collapsed: boolean; closeOthers?: boolean }>) {
      console.log(action.payload)
      const { key, collapsed, closeOthers } = action.payload
      if (closeOthers) {
        // 如果需要关闭其他的分类，首先将所有的分类都设置为关闭状态
        state.history.isExpanded = false
        state.wish.isExpanded = false
        state.category.forEach((item) => {
          item.isExpanded = false
        })
      }
      if (key === '最近使用' || key === 'history') {
        state.history.isExpanded = collapsed
      } else if (key === '我的收藏' || key === 'wish') {
        state.wish.isExpanded = collapsed
      } else {
        state.category.forEach((item) => {
          if (item.title === key) {
            item.isExpanded = collapsed
          }
        })
      }
    },
    //初始化current数据
    initCurrentCategory(state) {
      state.currentCategory = {} as WritingChildrenList
    },
    // 筛选category列表 通过nickname搜索
    filterCategoryList(state, action: PayloadAction<{ nickname?: string; reduction?: boolean }>) {
      const { nickname, reduction } = action.payload
      if (reduction) {
        state.category = state.pureCategory
      }
      if (!nickname) return
      state.category = state.pureCategory.map((category) => {
        return {
          ...category,
          list: category.list.filter((item) => {
            return item.nickname.normalize().includes(nickname)
          })
        }
      })
    },
    // 更新收藏列表
    updateWishList(state, action: PayloadAction<{ category: WritingChildrenList; is_wish: 0 | 1 }>) {
      const { category, is_wish } = action.payload

      let newList: WritingChildrenList[]
      if (is_wish === 0) {
        // 添加到收藏列表
        newList = [...state.wish.list, { ...category, is_wish: 1 }]
      } else {
        // 从收藏列表中移除
        newList = state.wish.list.filter((wishItem) => wishItem.id !== category.id)
      }

      // 更新每个category的list列表中对应项的is_wish属性
      const newCategoryList: WritingCategory[] = state.category.map((categoryItem) => {
        return {
          ...categoryItem,
          list: categoryItem.list.map((listItem) => (listItem.id === category.id ? { ...listItem, is_wish: is_wish === 0 ? 1 : 0 } : listItem))
        }
      })

      // 如果history的list数组中有这一项，更新其is_wish属性
      const newHistoryList: WritingChildrenList[] = state.history.list.some((historyItem) => historyItem.id === category.id) ? state.history.list.map((historyItem) => (historyItem.id === category.id ? { ...historyItem, is_wish: is_wish === 0 ? 1 : 0 } : historyItem)) : state.history.list
      state.wish.list = newList
      state.category = newCategoryList
      state.history.list = newHistoryList
    },
    // 更新最近使用记录列表
    updateHistoryList(state, action: PayloadAction<WritingCategory>) {
      state.history = action.payload
    }
  },
  extraReducers(builder) {
    // 成功之后保存用户信息
    builder.addCase(getWritingCategoryList.fulfilled, (state, { payload }: PayloadAction<void | WritingCategory[]>) => {
      if (payload) {
        payload = payload.filter((item) => item.name !== 'SystemWish' && item.name !== 'SystemHistory')
        if (state.currentCategory && Object.keys(state.currentCategory).length > 0) {
          const currentCategoryId = state.currentCategory.categoryId
          // 检查 history 和wish 列表是否已经展开了 currentCategory
          const isExpandedInHistory = state.history.isExpanded
          const isExpandedInWish = state.wish.isExpanded

          if (!isExpandedInHistory && !isExpandedInWish) {
            const category = payload.find((category) => category.id === currentCategoryId)
            if (category) {
              category.isExpanded = true
            }
          }
          state.category = payload || []
          state.pureCategory = payload || []
        } else {
          state.category = payload || []
          state.pureCategory = payload || []
        }
      }
    })
    builder.addCase(getWritingDetail.fulfilled, (state, { payload }: PayloadAction<void | WritingChildrenList>) => {
      state.currentCategory = payload ?? ({} as WritingChildrenList)
    })
    builder.addCase(getWishList.fulfilled, (state, { payload }: PayloadAction<void | WritingChildrenList[]>) => {
      state.wish.list = payload ?? []
    })
    builder.addCase(getHistoryList.fulfilled, (state, { payload }: PayloadAction<void | WritingChildrenList[]>) => {
      state.history.list = payload ?? []
    })
  }
})

export const { updateCollapsed, initCurrentCategory, updateWishList, filterCategoryList } = creativitySlice.actions

export default creativitySlice.reducer
