// 产品矩阵
export const productMatrix = [
  {
    key: 'OneAsk',
    value: 'OneAsk 企业一站式AI应用平台',
    lable: 'OneAsk 企业一站式AI应用平台',
    url: 'https://resource.gotoai.world/upload/system/OneAsk.pdf'
  },
  {
    key: 'AskDocs',
    value: 'AskDocs 企业AI智能文书写作平台',
    lable: 'AskDocs 企业AI智能文书写作平台',
    url: 'https://resource.gotoai.world/upload/system/AskDocs.pdf'
  },
  {
    key: 'AskIdea',
    value: 'AskIdea 企业AI智能创意设计平台',
    lable: 'AskIdea 企业AI智能创意设计平台',
    url: 'https://resource.gotoai.world/upload/system/AskIdea.pdf'
  },
  {
    key: 'AskSales',
    value: 'AskSales 企业AI智能数字化营销平台',
    lable: 'AskSales 企业AI智能数字化营销平台',
    url: 'https://resource.gotoai.world/upload/system/AskSales.pdf'
  }
]

declare const __REACT_APP_BASE_URL: {
  REACT_APP_BASE_URL: string
  REACT_APP_VIDEO_BASE_URL: string
  REACT_APP_FANYI_BASE_URL: string
}
export const REACT_APP_BASE_URL_CONFIG =
  process.env.NODE_ENV === 'production'
    ? __REACT_APP_BASE_URL
    : {
        REACT_APP_BASE_URL: 'http://47.121.24.110:8003/api',
        REACT_APP_VIDEO_BASE_URL: 'https://video.cloud-pioneer.com/api/v1/',
        REACT_APP_FANYI_BASE_URL: 'https://fanyi.cloud-pioneer.com'
      }
