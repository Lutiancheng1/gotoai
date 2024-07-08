/* eslint-disable jsx-a11y/anchor-is-valid */
import { FloatButton } from 'antd'
import './inxdex.css'
import { useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { useNavigate } from 'react-router-dom'
const CaseCenter: React.FC = () => {
  const naviagte = useNavigate()
  // 当前筛选条件
  const [currentFilter, setCurrentFilter] = useState({
    industry: ['content 1', 'content 2'],
    product: ['content 1'],
    scale: ['content 1']
  })

  // 新增筛选条件的函数
  const addFilterItem = (type: 'industry' | 'product' | 'scale', item: string) => {
    setCurrentFilter((prev) => {
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
    setCurrentFilter((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i !== item)
    }))
  }

  useUpdateEffect(() => {
    console.log(currentFilter, 'currentFilter')
  }, [currentFilter])

  const clearAll = () => {
    setCurrentFilter({
      industry: [],
      product: [],
      scale: []
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
            {Object.values(currentFilter).flat().length > 0 && (
              <>
                <br />
                <div className="active-facets">
                  <h4>当前筛选</h4>
                  {currentFilter.industry.length > 0 && (
                    <details className="collapse collapse-arrow mb-2 !text-white" open>
                      <summary className="collapse-title">行业</summary>
                      <div className="collapse-content">
                        {currentFilter.industry.map((item, index) => (
                          <p className="flex justify-between" key={index} onClick={() => removeFilterItem('industry', item)}>
                            {item} <i className="iconfont icon-x"></i>
                          </p>
                        ))}
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
                  {currentFilter.scale.length > 0 && (
                    <details className="collapse collapse-arrow" open>
                      <summary className="collapse-title">组织规模</summary>
                      <div className="collapse-content">
                        {currentFilter.scale.map((item, index) => (
                          <p className="flex justify-between" key={index} onClick={() => removeFilterItem('scale', item)}>
                            {item} <i className="iconfont icon-x"></i>
                          </p>
                        ))}
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
                {Array.from({ length: 10 }).map((_, index) => (
                  <p key={index} onClick={() => addFilterItem('industry', `content ${index}`)}>
                    content {index}
                  </p>
                ))}
              </div>
            </details>
            <details className="collapse collapse-arrow mb-2 dark">
              <summary className="collapse-title">产品与服务</summary>
              <div className="collapse-content dark">
                {Array.from({ length: 10 }).map((_, index) => (
                  <p key={index} onClick={() => addFilterItem('product', `content ${index}`)}>
                    content {index}
                  </p>
                ))}
              </div>
            </details>
            <details className="collapse collapse-arrow dark">
              <summary className="collapse-title">组织规模</summary>
              <div className="collapse-content dark">
                {Array.from({ length: 10 }).map((_, index) => (
                  <p key={index} onClick={() => addFilterItem('scale', `content ${index}`)}>
                    content {index}
                  </p>
                ))}
              </div>
            </details>
          </div>
        </div>
        <div className="w-3/4 sl-results nw-scrollbar overflow-y-auto pr-[15px]">
          {Array.from({ length: 10 }).map((_, index) => (
            <div className="search-result-container" key={index} onClick={() => naviagte(`/caseDetail/${index}`)}>
              <div className="search-result">
                <div className="search-result__inner">
                  <img alt="" className="result_success_image" src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1784294520000231012-joyson-microsoft-sentine-automotive-zh-china/resources/fede45c6-a4c7-4b64-8361-81368c18c30a/asset1787552665889865835_1787552665889865835" />
                  <div className="search-result__data">
                    <div className="facet-type">
                      <span>Automotive</span>
                    </div>
                    <h3 lang="zh">均胜电子携手微软 SOC 解决方案构筑现代化信息安全运维体系，守护客户信任与品牌价值</h3>
                    <div className="search-result__indicators"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
