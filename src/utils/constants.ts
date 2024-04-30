// 一些配置项

// menu菜单配置
export const menuConfig = [
  {
    key: 'talk',
    icon: 'icon-message',
    label: '对话'
  },
  {
    key: 'document',
    icon: 'icon-wendang',
    label: '文档'
  },
  {
    key: 'code',
    icon: 'icon-daimamoshi',
    label: '代码'
  },
  {
    key: 'knowledgeBase',
    icon: 'icon-zhishiku',
    label: '知识库'
  },
  {
    key: 'dataAnalysis',
    icon: 'icon-shujufenxi',
    label: '数据分析'
  },
  {
    key: 'drawDesigns',
    icon: 'icon-hf_zxphuatu',
    label: '画图'
  },
  {
    key: 'video',
    icon: 'icon-movie',
    label: '视频',
    disabled: true
  },
  {
    key: 'application',
    icon: 'icon-applications',
    label: '应用'
  }
] as {
  key: string
  icon: string
  label: string
  disabled?: boolean
}[]

/**
 * @param { 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}
 * @returns {对话｜文档｜代码｜知识库｜数据分析｜画图｜视频｜应用｜客服app}
 */
export type menuType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const menuWarp = {
  '/talk': 0,
  '/document': 1,
  '/code': 2,
  '/knowledgeBase': 3,
  '/dataAnalysis': 4,
  '/drawDesigns': 5,
  '/video': 6,
  '/application': 7
} as {
  [key: string]: number
}
