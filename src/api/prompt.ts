import { http } from '@/utils/request'

// 获取页面提词列表

export const getMenuPrompts = async (menu: number) => {
  let uri = '/Prompt/GetMenuPrompts?menu=' + menu
  return http.get(uri)
}

// 获取单个提词
export const getPrompt = (id: number) => {
  let uri = '/Prompt?id=' + id
  return http.get(uri)
}

// 获取当前用户的提词列表
export const getUserPrompts = async () => {
  let uri = '/Prompt/UserPrompts'
  return http.get(uri)
}

// 获取提词分类
export const getPromptTypes = async () => {
  let uri = '/PromptCategory/CategoryList'
  return http.get(uri)
}

// 根据提词分类 获取详细提词列表
export const getPromptList = (categoryId: number) => {
  let uri = 'Prompt/GetPrompts?categoryId=' + categoryId
  return http.get(uri)
}
