// 大模型
export const models = ['Midjourney', 'Stable Diffusion']
// 图片比例
export const pictureRatioWarp = [
  {
    label: '1:1',
    value: '1:1',
    w: 100,
    h: 100
  },
  {
    label: '4:3',
    value: '4:3',
    w: 100,
    h: 75
  },
  {
    label: '3:4',
    value: '3:4',
    w: 75,
    h: 100
  },
  {
    label: '16:9',
    value: '16:9',
    w: 100,
    h: 57
  },
  {
    label: '9:16',
    value: '9:16',
    w: 57,
    h: 100
  }
]
// 次级tab
export const tabs = ['imageCreation', 'imageProcessing', 'gallery']
export const tabsWarp = {
  imageCreation: '图像创作',
  imageProcessing: '图像处理',
  gallery: '画廊'
} as {
  [key: string]: string
}
// 画质
export const stylizationWarp = [
  {
    label: '低',
    value: 50
  },
  {
    label: '中',
    value: 100
  },
  {
    label: '高',
    value: 250
  },
  {
    label: '强烈',
    value: 750
  }
]
// MJ NIJI
export const modelVersions = {
  MJ: [
    {
      label: '6',
      value: 6
    },
    {
      label: '5.2',
      value: 5.2
    },
    {
      label: '5.1',
      value: 5.1
    }
  ],
  NIJI: [
    {
      label: '6',
      value: 6
    },
    {
      label: '5',
      value: 5
    }
  ]
} as { [key: string]: { label: string; value: number }[] }
export const modalWarp = ['MJ', 'NIJI'] as ['MJ', 'NIJI']
// 画质阶层
export const qualityLevels = [
  { value: 0.25, label: '一般' },
  { value: 0.5, label: '清晰' },
  { value: 1, label: '高清' },
  { value: 2, label: '超高清' }
]
export type ITab = 'imageCreation' | 'imageProcessing' | 'gallery'

// 风格
export const stylesWarp = [
  {
    value: 'raw',
    label: '默认'
  },
  {
    value: 'scenic',
    label: '风景'
  },
  {
    value: 'expressive',
    label: '想象力'
  },
  {
    value: 'cute',
    label: '可爱'
  }
]
