//  客户案例
import { http } from '@/utils/axios'

type Res = {
  data: {
    id: number
    title: string
    desc: string
  }[]
  code: number
  key: string
  msg: string
}
export type CaseData = {
  id: number
  caseNo: string
  title: string
  logo: string | null
  customerName: string
  industry: string
  product: string
  organizationSize: string
  companyProfile: string
  case: string
  solution: string
  earnings: string
}
// 获取行业列表
export const getIndustryList = async () => {
  return http.get('/Customerstory/IndustryList') as Promise<Res>
}

// 获取组织规模
export const getOrganizationsizeList = async () => {
  return http.get('/Customerstory/OrganizationsizeList') as Promise<Res>
}

//  获取产品列表
export const getProductList = async () => {
  return http.get('/Customerstory/ProductList') as Promise<Res>
}

type CustomerStoryListParams = {
  keywords?: string
  page: number
  pageSize: number
  sort?: string
  order?: string
  title?: string
  customerName?: string
  industry?: string
  product?: string
  organizationSize?: string
}

// 获取客户案例列表
export const getCustomerStoryList = async (params: CustomerStoryListParams) => {
  return http.post('/Customerstory/SearchCustomerstory', params) as Promise<{
    code: number
    key: string
    msg: string
    pageCount: number
    pageIndex: number
    recordCount: number
    rows: CaseData[]
  }>
}
