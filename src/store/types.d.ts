export interface Token {
  token: string
  // refresh_token: string
  type: number | string
  validTo: string
}

export type User = {
  desc: string
  email: string
  id: number | string
  password: string
  phone: string
  roles: any[]
  status: number
  type: number
  username: string
}
export type TalkFile = {
  id: number
  chatId: number
  type: string
  url: string
  mimetype: string
  fileId: string
  name: string
  size: number
  indexuri?: any
  summary: string
}
// 对话模块
export type HistoryList = {
  id: number
  title: string
  userId: number
  createTime: string
  updateTime: string
  model: string
  menu: number
  conversationid: string
  provider: string
  files: TalkFile[]
}
// 对话历史查询条件
export interface GetHistoryFroMenu {
  menu: number //页面，0.对话，1.文档，2.代码，3.知识库，4.数据分析，5.画图，6.视频，7.应用
  page: number
  pageSize: number
}

// 创建新回话
export interface NewQuestion {
  id: number | string
  title: string
  userId: number | string
  createTime: string
  updateTime: string
  model: string
  menu: number
  conversationid: string
}

// 对话消息
export interface MessageInfo {
  id: number | string
  chatId: number | string
  content: string
  createtime: string
  type: 0 | 1 //类型，0.user,1.ai
  resource: string
  UUID?: string
  isLoading?: boolean
  files?: {
    id: number | string
    chatMessageId?: number
    type: string
    url: string
    mimetype?: string
    name: string
    size: number
  }[]
}

// 开场白的基本信息
export interface PrologueInfo {
  id: number
  menu: number
  content: string //开场白
  status: number
  examples: string[] //例子
}
// 对话
export interface ChatMessages {
  query: string
  inputs?: {
    [key: string]: string
  }
  conversationId: string
  menu: number
  resource?: string
  files?: string[]
}

export interface DifyInfo {
  appId: string
  apiUrl: string
  apikey: string
}
