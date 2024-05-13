import { Category, CategorysDetail, History, Wish } from '@/pages/MarketingCreativity/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const MarketingJson = require('@/mocks/marketingCreativity.json') as {
  category: Category[]
  history: History
  wish: Wish
  details: { [key: string]: CategorysDetail }
}

export interface CreativityState {
  category: Category[]
  history: History
  wish: Wish
}

export const initialState: CreativityState = {
  category: MarketingJson.category,
  history: MarketingJson.history,
  wish: MarketingJson.wish
}

const creativitySlice = createSlice({
  name: 'creativity',
  initialState,
  reducers: {
    updateCreativityData(state, action: PayloadAction<CreativityState>) {
      return action.payload
    },
    // 更新折叠状态
    updateCollapsed(state, action: PayloadAction<{ key: string; collapsed: boolean; closeOthers?: boolean }>) {
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
    }
  }
})

export const { updateCreativityData, updateCollapsed } = creativitySlice.actions

export default creativitySlice.reducer
