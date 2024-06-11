// 一些配置项

// menu菜单配置
export const menuConfig = [
  {
    key: 'talk',
    icon: 'icon-008duihuakuang-8',
    label: '对话'
  },
  {
    key: 'document',
    icon: 'icon-wendang1',
    label: '文档'
  },
  {
    key: 'documents',
    icon: 'icon-duowendang',
    label: '多文档'
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
    icon: 'icon-shujufenxi1',
    label: '数据分析'
  },
  {
    key: 'drawDesigns',
    icon: 'icon-hf_zxphuatu',
    label: '图像创作'
  },
  {
    key: 'videoCreation',
    icon: 'icon-fabudankuang-shipinchuangzuo',
    label: '视频创作'
  },
  {
    key: 'marketingCreativity',
    icon: 'icon-yingxiaochuangyi',
    label: '营销创意'
  },
  {
    key: 'writing',
    icon: 'icon-xiezuo',
    label: '文书写作'
  },
  {
    key: 'smartCustomerService',
    icon: 'icon-zhinengkefu font-600',
    label: '智能客服'
  },
  // {
  //   key: 'aiSearch',
  //   icon: 'icon-AIsearch',
  //   label: 'AI 搜索'
  // },
  // {
  //   key: 'aiTranslation',
  //   icon: 'icon-zimu',
  //   label: 'AI 翻译'
  // },
  {
    key: 'businessOpportunities',
    icon: 'icon-businessOpportunities',
    label: '商机获客'
  },
  {
    key: 'application',
    icon: 'icon-yingyong',
    label: '应用'
  }
] as {
  key: string
  icon: string
  label: string
  disabled?: boolean
}[]

/**
 * @param { 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 }
 * @returns {对话｜文档｜代码｜知识库｜数据分析｜画图｜视频｜应用｜客服app、智能客服｜营销创意｜文书写作｜多文档}
 */
export type menuType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export const menuWarp = {
  '/talk': 0,
  '/document': 1,
  '/documents': 11,
  '/code': 2,
  '/knowledgeBase': 3,
  '/dataAnalysis': 4,
  '/drawDesigns': 5,
  '/video': 6,
  '/application': 7,
  '/smartCustomerService': 8,
  '/marketingCreativity': 9,
  '/writing': 10
} as {
  [key: string]: number
}
