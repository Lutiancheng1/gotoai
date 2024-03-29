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
    label: '视频'
  },
  {
    key: 'application',
    icon: 'icon-applications',
    label: '应用'
  }
]
/**
 * @param { 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}
 * @returns {对话｜文档｜代码｜知识库｜数据分析｜画图｜视频｜ying y}
 */
export type menuType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
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
export const promptConfig = [
  '软件开发工程师',
  '人力资源分析师',
  '财务管理总监',
  '数据分析师',
  '硬件研发工程师',
  '薪资规划师',
  '绩效管理师',
  '行政管理经理',
  '生产管理经理',
  '工程项目经理',
  '产品设计师',
  '图形设计工程师',
  '法务经理',
  '品牌公关经理',
  '战略规划师',
  '市场开发经理',
  '销售经理',
  '企业培训讲师',
  '财务分析师',
  '审计师'
]
