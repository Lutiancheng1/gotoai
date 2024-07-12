/* eslint-disable jsx-a11y/anchor-is-valid */
import { Empty, FloatButton } from 'antd'
import './inxdex.css'
import { useEffect, useRef, useState } from 'react'
import { useMount, useScroll, useUpdateEffect } from 'ahooks'
import { useNavigate } from 'react-router-dom'
import { CaseData, getCustomerStoryList, getIndustryList, getOrganizationsizeList, getProductList } from '@/api/customerstory'
import Loading from '@/components/loading'

type FilterData = {
  id: number
  title: string
  desc: string
}[]

const CaseCenter: React.FC = () => {
  const naviagte = useNavigate()
  // 当前筛选条件
  const [currentFilter, setCurrentFilter] = useState<{
    industry: string
    product: string[]
    scale: string
  }>({
    industry: '',
    product: [],
    scale: ''
  })
  // 行业
  const [industryList, setIndustryList] = useState<FilterData>([])
  // 组织规模
  const [organizationSizeList, setOrganizationSizeList] = useState<FilterData>([])
  //  产品
  const [productList, setProductList] = useState<FilterData>([])
  // dataSource
  const [dataSource, setDataSource] = useState<CaseData[]>([])
  // loading
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = useScroll(scrollRef)
  const [pagenation, setPagenation] = useState({
    page: 1,
    pageSize: 12,
    total: 0
  })

  useUpdateEffect(() => {
    // 这个是滚动容器的高度
    const scrollBoxHeight = window.innerHeight - 149
    // 当前滚动位置
    const scrollPosition = scrollRef.current!.scrollTop + scrollBoxHeight
    // 滚动容器的总高度减去100px
    const bottomPosition = scrollRef.current!.scrollHeight - 100
    if (scrollPosition >= bottomPosition) {
      // loadmore
      if (pagenation.page * pagenation.pageSize < pagenation.total) {
        getDataSource(pagenation.page + 1)
      }
    }
  }, [scroll])

  const getDataSource = async (page?: number) => {
    if (loading) return
    setLoading(true)
    const res = await getCustomerStoryList({ page: page ?? pagenation.page, pageSize: pagenation.pageSize, industry: currentFilter.industry, product: currentFilter.product.toString(), organizationSize: currentFilter.scale })
    if (res.code === 0 && res.rows) {
      setPagenation((prev) => {
        return {
          ...prev,
          page: res.pageIndex,
          total: res.recordCount
        }
      })
      if (page && page > 1) {
        setDataSource((prev) => {
          return [...prev, ...res.rows]
        })
      } else {
        setDataSource(res.rows)
      }
    }
    setLoading(false)
  }

  useUpdateEffect(() => {
    getDataSource(1)
  }, [currentFilter])

  const clearAll = () => {
    setCurrentFilter({
      industry: '',
      product: [],
      scale: ''
    })
  }
  useMount(async () => {
    const res1 = await getIndustryList()
    if (res1.code === 0 && res1.data) {
      setIndustryList(res1.data)
    }
    const res2 = await getOrganizationsizeList()
    if (res2.code === 0 && res2.data) {
      setOrganizationSizeList(res2.data)
    }
    const res3 = await getProductList()
    if (res3.code === 0 && res3.data) {
      setProductList(res3.data)
    }
    setLoading(false)
    getDataSource()
  })

  // 新增筛选条件的函数
  const addFilterItem = (type: 'industry' | 'product' | 'scale', item: string) => {
    setCurrentFilter((prev) => {
      if (type === 'scale' || type === 'industry') {
        return {
          ...prev,
          [type]: item
        }
      }
      // 检查是否已经存在该筛选条件
      if (prev[type].includes(item)) {
        return prev // 如果已经存在，则不做任何修改
      }
      return {
        ...prev,
        [type]: [...prev[type], item]
      }
    })
  }

  // 删除筛选条件的函数
  const removeFilterItem = (type: 'industry' | 'product' | 'scale', item: string) => {
    setCurrentFilter((prev) => {
      if (type === 'scale' || type === 'industry') {
        return {
          ...prev,
          [type]: ''
        }
      }
      return {
        ...prev,
        [type]: prev[type].filter((i) => i !== item)
      }
    })
  }
  return (
    <div className="case-center w-full h-full">
      <div className="w-full text-[#1a2029] bg-white p-2">
        <p className="text-28 font-600 *:leading-7">GotoAI 案例研究</p>
        <p className="font-400 text-14 mt-3 line-clamp-1" title="各行各业和各种规模的组织（从初创企业到财富 500 强）都在使用OpenAI及GotoAI 企业级AI解决方案创造辉煌。按行业探索 GotoAI 客户成功案例，了解我们的AI 解决方案如何解决客户在业务转型中遇到的挑战。">
          各行各业和各种规模的组织（从初创企业到财富 500 强）都在使用OpenAI及GotoAI 企业级AI解决方案创造辉煌。 按行业探索 GotoAI 客户成功案例，了解我们的AI 解决方案如何解决客户在业务转型中遇到的挑战。
        </p>
      </div>
      <div className="py-2">
        <p className="text-28 font-600 *:leading-7 pl-2">案例搜索</p>
      </div>
      <div className="w-full h-[calc(100%-149px)] flex overflow-hidden mb-4">
        <div className="w-1/4 overflow-hidden pl-2">
          <div className="cursor-pointer text-[#0067B8]" onClick={clearAll}>
            清除筛选器
          </div>
          <div className="h-[calc(100%-26px)] nw-no-scroll overflow-y-auto pl-1 px-3">
            {currentFilter && (Object.values(Object.assign(currentFilter.industry, currentFilter.product)).flat().length > 0 || currentFilter.scale) && (
              <>
                <br />
                <div className="active-facets">
                  <h4>当前筛选</h4>
                  {currentFilter.industry && (
                    <details className="collapse collapse-arrow mb-2 !text-white" open>
                      <summary className="collapse-title">行业</summary>
                      <div className="collapse-content">
                        <p className="flex justify-between" onClick={() => removeFilterItem('industry', currentFilter.industry)}>
                          {currentFilter.industry} <i className="iconfont icon-x"></i>
                        </p>
                      </div>
                    </details>
                  )}
                  {currentFilter.product.length > 0 && (
                    <details className="collapse collapse-arrow mb-2 !text-white" open>
                      <summary className="collapse-title">产品与服务</summary>
                      <div className="collapse-content">
                        {currentFilter.product.map((item, index) => (
                          <p className="flex justify-between" key={index} onClick={() => removeFilterItem('product', item)}>
                            {item} <i className="iconfont icon-x"></i>
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                  {currentFilter.scale && (
                    <details className="collapse collapse-arrow" open>
                      <summary className="collapse-title">组织规模</summary>
                      <div className="collapse-content">
                        <p className="flex justify-between" onClick={() => removeFilterItem('scale', currentFilter.scale)}>
                          {currentFilter.scale} <i className="iconfont icon-x"></i>
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              </>
            )}
            <br />
            <details className="collapse collapse-arrow mb-2 dark">
              <summary className="collapse-title">行业</summary>
              <div className="collapse-content dark">
                {industryList &&
                  industryList.length > 0 &&
                  industryList.map((item) => (
                    <p key={item.id} className={`${currentFilter.industry === item.title ? 'active' : ''}`} onClick={() => addFilterItem('industry', item.title)}>
                      {item.title}
                    </p>
                  ))}
              </div>
            </details>
            <details className="collapse collapse-arrow mb-2 dark">
              <summary className="collapse-title">产品与服务</summary>
              <div className="collapse-content dark">
                {productList &&
                  productList.length > 0 &&
                  productList.map((item, index) => (
                    <p key={index} className={`${currentFilter.product.includes(item.title) ? 'active' : ''}`} onClick={() => addFilterItem('product', item.title)}>
                      {item.title}
                    </p>
                  ))}
              </div>
            </details>
            <details className="collapse collapse-arrow dark">
              <summary className="collapse-title">组织规模</summary>
              <div className="collapse-content dark">
                {organizationSizeList &&
                  organizationSizeList.length > 0 &&
                  organizationSizeList.map((item) => (
                    <p key={item.id} className={`${currentFilter.scale === item.title ? 'active' : ''}`} onClick={() => addFilterItem('scale', item.title)}>
                      {item.title}
                    </p>
                  ))}
              </div>
            </details>
          </div>
        </div>
        <div className="w-3/4 sl-results nw-scrollbar overflow-y-auto pr-[15px]" ref={scrollRef}>
          {dataSource &&
            dataSource.map((item, index) => (
              <div
                className="search-result-container max-h-[50%]"
                key={index}
                onClick={() =>
                  naviagte(`/caseDetail`, {
                    state: item
                  })
                }
              >
                <div className="search-result">
                  <div className="search-result__inner">
                    <img alt="" className="result_success_image" src={item.logo ?? ''} />
                    <div className="search-result__data">
                      <div className="facet-type">
                        <span>{item.industry}</span>
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {loading && <Loading />}
          {pagenation.total > 0 && pagenation.page * pagenation.pageSize > pagenation.total && <p className="w-full vh-center mb-2">没有更多了</p>}
        </div>
      </div>
      <FloatButton.BackTop
        style={{
          right: 30
        }}
        tooltip="回到顶部"
        className="hover:opacity-80"
        visibilityHeight={200}
        target={() => document.querySelector('.sl-results') as HTMLDivElement}
      />
    </div>
  )
}
export default CaseCenter
