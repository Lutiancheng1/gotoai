//  菜单类别
export interface Category {
  icon: string
  icon_hover: string
  icon_small: string
  list: List[]
  title: string
  isExpanded: boolean
}
// 菜单列表
export interface List {
  uid: string
  chat_type: number
  nickname: string
  icon: string
  description: string
  is_wish: 0 | 1 // 是否收藏 1 收藏 0 未收藏
  topics: number
}
// 菜单历史列表
export interface History {
  icon: string
  icon_hover: string
  icon_small: string
  list: List[]
  title: string
  isExpanded: boolean
}
// 菜单收藏列表
export interface Wish {
  icon: string
  icon_hover: string
  icon_small: string
  list: List[]
  title: string
  isExpanded: boolean
}
// 分类详情
export interface CategorysDetail {
  extra?: any
  icon: string
  list: ListDetail[]
  support_flow: number
  support_ind_report: number
  title: string
}
// 分类详情子list
export interface ListDetail {
  default: string[]
  err_msg: string
  input_name: string
  input_type: string
  placeholder: string
  option?: string[]
  title: string
  btn_text: string
  accept: string
  max_size: number
}
