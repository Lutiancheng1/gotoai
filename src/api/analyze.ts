import { http } from '@/utils/axios'
// 商机查询
export type BusinessParams = Partial<{
  keywords: string
  page: number
  pageSize: number
  sort: string
  order: string
  entryStartTime: string
  entryEndTime: string
  currentStatus: string
  customerManager: string
  customerName: string
  estimatedContractMin: number
  estimatedContractMax: number
}>
export type Response = {
  code: number
  msg: string
  rows: []
  recordCount: number
  pageCount: number
  pageIndex: number
  ext: string
}

export const BusinessSearch = async (params: BusinessParams) => {
  const res = (await http.post('/Analyze/BusinessSearch', params)) as Response
  if (res.code === 0) {
    return res as Response
  }
}

// 项目查询
export type ProjectParams = Partial<{
  keywords: string
  page: number
  pageSize: number
  sort: string
  order: string
  signingStartTime: string
  signingEndTime: string
  customerName: string
  projectManager: string
  contractAmountMin: number
  contractAmountMax: number
}>

export const ProjectSearch = async (params: ProjectParams) => {
  const res = (await http.post('/Analyze/ProjectSearch', params)) as Response
  if (res.code === 0) {
    return res
  }
}

// 项目营收查询
export type ProjectRevenueParams = Partial<{
  keywords: string
  page: number
  pageSize: number
  sort: string
  order: string
  signingStartTime: string
  signingEndTime: string
  customerName: string
  currentStatus: string
  projectManager: string
  contractAmountMin: number
  contractAmountMax: number
  paymentMin: number
  paymentMax: number
}>

export const ProjectRevenueSearch = async (params: ProjectRevenueParams) => {
  const res = (await http.post('/Analyze/ProjectRevenueSearch', params)) as Response
  if (res.code === 0) {
    return res
  }
}

// 商机分析
export const BusinessAnalyze = async () => {
  const res = (await http.get('/Analyze/BusinessAnalyze')) as { code: number; msg: string; data: any }
  if (res.code === 0) {
    return res.data as { data: {}; data2: {}; data3: {} }
  }
}
// 项目分析
export const ProjectAnalyze = async () => {
  const res = (await http.get('/Analyze/ProjectAnalyze')) as { code: number; msg: string; data: any }
  if (res.code === 0) {
    return res.data as { data: {}; data2: {}; data3: {} }
  }
}
// 项目营收分析
export const ProjectRevenueAnalyze = async () => {
  const res = (await http.get('/Analyze/ProjectRevenueAnalyze')) as { code: number; msg: string; data: any }
  if (res.code === 0) {
    return res.data as { data: {}; data2: {}; data3: {} }
  }
}
