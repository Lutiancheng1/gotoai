import React, { useEffect, useRef, useState } from 'react'
import './index.css'
import History from '@/components/history'
import { titleWarp } from '@/components/InitPage'
import Dialogue from '@/components/Dialogue_agent'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { talkInitialState } from '@/store/reducers/talk'
import { UserPrompt } from '../Talk'
import { getMenuPrologue } from '@/api/prologue'
import { PrologueInfo } from '@/store/types'
import { menuWarp } from '@/utils/constants'
import { useLocation } from 'react-router-dom'
import * as echarts from 'echarts'
import { businessOpportunityEstimationAmountOption, businessOpportunitySummaryOption, contractColumnRepaymentAmountOption, projectReturnRateAnalysisOption, projectReturnRateOption, projectSummaryOption } from './chars'
import SearchFrom, { DataSourceT } from './searchFrom'
import { BusinessAnalyze, ProjectAnalyze, ProjectRevenueAnalyze } from '@/api/analyze'
type Props = {} & Partial<talkInitialState>
const keyWarpper = [
  {
    title: '商机分析',
    key: 'businessOpportunity'
  },
  {
    title: '项目分析',
    key: 'project'
  },
  {
    title: '经营分析',
    key: 'management'
  }
] as {
  title: string
  key: 'businessOpportunity' | 'project' | 'management'
}[]

const DataAnalysis = ({ isNewChat, loading }: Props) => {
  const location = useLocation()
  const [initPrologue, setInitPrologue] = useState<PrologueInfo>()
  const [currentTab, setCurrentTab] = useState<'businessOpportunity' | 'project' | 'management'>('businessOpportunity')
  const leftChartRef = useRef<HTMLDivElement>(null)
  const rightChartRef = useRef<HTMLDivElement>(null)
  // 存储搜索参数
  const [values, setValues] = useState<any>({})
  // 存储Data
  const [data, setData] = useState({} as DataSourceT)
  // 是否在内部搜索
  const [isSearch, setIsSearch] = useState(false)
  const runderCharts = async () => {
    if (leftChartRef.current && rightChartRef.current) {
      // 尝试获取现有的 ECharts 实例
      let leftChart = echarts.getInstanceByDom(leftChartRef.current)
      let rightChart = echarts.getInstanceByDom(rightChartRef.current)

      // 如果存在，则先销毁现有实例
      if (leftChart) {
        echarts.dispose(leftChartRef.current)
      }
      if (rightChart) {
        echarts.dispose(rightChartRef.current)
      }

      // 销毁后重新初始化
      leftChart = echarts.init(leftChartRef.current)
      rightChart = echarts.init(rightChartRef.current)

      if (currentTab === 'businessOpportunity') {
        const res = await BusinessAnalyze()
        if (!res) return
        leftChart.setOption(businessOpportunitySummaryOption(Object.keys(res.data), Object.values(res.data)))
        rightChart.setOption(businessOpportunityEstimationAmountOption(Object.keys(res.data2), Object.values(res.data2)))
      } else if (currentTab === 'project') {
        const res = await ProjectAnalyze()
        if (!res) return
        leftChart.setOption(projectSummaryOption(Object.keys(res.data), Object.values(res.data)))
        rightChart.setOption(projectReturnRateOption(Object.keys(res.data3), [Object.values(res.data3 as [number, number][]).map((item) => item[0]), Object.values(res.data3 as [number, number][]).map((item) => item[1])]))
      } else if (currentTab === 'management') {
        const res = await ProjectRevenueAnalyze()
        if (!res) return
        leftChart.setOption(contractColumnRepaymentAmountOption(Object.keys(res.data), [Object.values(res.data as [number, number][]).map((item) => item[0]), Object.values(res.data as [number, number][]).map((item) => item[1])]))
        rightChart.setOption(projectReturnRateAnalysisOption)
      }
      // 返回一个清理函数，以便在组件卸载时可以清理资源
      return () => {
        echarts.dispose(leftChartRef.current!)
        echarts.dispose(rightChartRef.current!)
      }
    }
  }

  useEffect(() => {
    runderCharts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, isNewChat])

  // 获取开场白信息
  useEffect(() => {
    const getData = async () => {
      const res = await getMenuPrologue(menuWarp[location.pathname])
      if (!res.data) return
      setInitPrologue(res.data)
      // 初始化渲染图表
      setTimeout(() => {
        runderCharts()
      }, 0)
    }
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void> }>()
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(false, item)
  }

  return (
    <div className="data-analysis">
      <History />
      <div className="analysis-container">
        <div
          className="analysis-box"
          style={{
            display: isSearch ? 'none' : ''
          }}
        >
          {isNewChat && initPrologue && (
            <div className="init_page animate__animated animate__fadeIn animate__faster">
              {/* 头部标题 和title */}
              <div className="title-box !mb-4">
                <p className="title">{titleWarp[initPrologue?.menu]}</p>
                <p className="sub-title"> {initPrologue?.content} </p>
              </div>
              {/*  tab切换 */}
              <ul className="w-full h-10 mb-3 flex border-[2px] border-[#bfbfbf] rounded-md cursor-pointer">
                {keyWarpper.map((item, index) => {
                  return (
                    <li key={item.key} onClick={() => setCurrentTab(item.key)} className={`vh-center flex-1 cursor-pointer text-[#b2b2b2] font-600 text-[16px] ${currentTab === item.key ? '!text-[#747474]' : ''} ${index !== keyWarpper.length - 1 ? 'border-r-[2px] border-r-[#bfbfbf]' : ''}`}>
                      {item.title}
                    </li>
                  )
                })}
              </ul>
              {/* 图表 */}
              <div className="w-full h-[200px] vh-center mb-3">
                <div className="flex-1 h-full border-r border-b px-1" ref={leftChartRef}></div>
                <div className="flex-1 h-full border-b px-1" ref={rightChartRef}></div>
              </div>
              {/*  筛选 */}
              <div className="w-full mb-2">
                <SearchFrom
                  currentTab={currentTab}
                  onSearch={() => !isSearch && setIsSearch(true)}
                  onFinish={(values, d) => {
                    setValues(values)
                    d && setData(d)
                  }}
                />
              </div>
              <div className="flex">
                {/* left */}
                <div className="example relative mr-20">
                  <h3 className=" font-semibold text-base mb-4">试试以下例子：</h3>
                  {initPrologue &&
                    initPrologue.examples.map((item) => {
                      return (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: item.replaceAll('\n', '<br/>')
                          }}
                          onClick={() => onPrompt({ ...initPrologue, title: item, prologue: initPrologue?.content, content: item })}
                          key={item}
                          title={item}
                          className="mb-2 hover:text-blue-500"
                        ></p>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
          <Dialogue ref={dialogueRef} sse={true} hasUploadBtn={false} />
        </div>
        <div
          className="px-4 py-4 animate__animated animate__fadeIn animate__faster"
          style={{
            display: !isSearch ? 'none' : '',
            width: 'calc(100vw - 210px - 164px )'
          }}
        >
          <SearchFrom currentTab={currentTab} data={data} fields={values} onClosed={() => setIsSearch(false)} hasResult={true} onFinish={() => {}} />
        </div>
      </div>
    </div>
  )
}

/**
 * mapStateToProps 函数：将 Redux 的 state 映射到组件的 props。
 *
 * @param {RootState} state - Redux 的 state 对象。
 * @returns {talkInitialState} - 包含了与对话相关的状态信息的对象。
 */
function mapStateToProps(state: RootState): talkInitialState {
  /**
   * 从 Redux 的 state 对象中提取与对话相关的状态信息，并将其作为 props 返回。
   *
   * @type {talkInitialState}
   */
  return state.talkSlice
}

/**
 * mapDispatchToProps 函数：将 dispatch 映射到组件的 props。
 *
 * @param {AppDispatch} dispatch - Redux 的 dispatch 函数。
 * @returns {{} | {[key: string]: any}} - 一个空对象，或者包含一些与组件相关的 dispatch 函数的对象。
 */
function mapDispatchToProps(dispatch: AppDispatch): {} | { [key: string]: any } {
  /**
   * 将 Redux 的 dispatch 函数映射到组件的 props 中，以便组件可以调用这些 dispatch 函数来更新 Redux 的状态。
   *
   * 注意：这里返回了一个空对象，因为 DataAnalysis 组件并没有需要 dispatch 的操作。
   * 如果该组件需要调用 dispatch 函数来更新状态，则应该在这里定义相应的 dispatch 函数，并将它们作为对象的属性返回。
   *
   * @example
   *
   * // 返回一个包含一些 dispatch 函数的对象
   * function mapDispatchToProps(dispatch: AppDispatch): { [key: string]: any } {
   *   return {
   *     fetchData: () => dispatch(fetchData()),
   *     updateState: (newState: Partial<State>) => dispatch(updateState(newState)),
   *   }
   * }
   */
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedDataAnalysis = connect(mapStateToProps, mapDispatchToProps)(DataAnalysis)

export default ConnectedDataAnalysis
