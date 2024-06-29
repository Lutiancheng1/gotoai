import { useEffect, useState } from 'react'
import './index.css'
import { useLocation } from 'react-router-dom'
import { menuWarp } from '@/utils/constants'
import { getMenuPrologue } from '@/api/prologue'
import { PrologueInfo } from '@/store/types'
import { UserPrompt } from '@/pages/Talk'
export const titleWarp = {
  2: '代码编程助手',
  3: '企业智脑',
  4: '数据分析助手',
  6: '视频助手'
} as {
  [key: number]: string
}
// 临时工作区
const TemporaryWorkingArea = [
  {
    title: '企业经营状况与财务表现分析',
    value: '分析2023年第四季度公司的财务概览，包括收入、利润、成本和现金流等关键指标  - 分析盈利能力和运营能力 \n的表现，以及2024年财务表现与预算的偏差，并解释主要的原因。'
  },
  {
    title: '企业盈利和运营能力分析',
    value: '请分析2024年第一季度的利润表，重点分析营业收入、成本、毛利润、营业利润、净利润的变化， 并分析变化\n的主要原因'
  },
  {
    title: '企业资产与负债数据分析',
    value: '企业资产与负债数据分析，分析2024年第一季度的资产负债表，重点关注总资产、总负债、股东权益的变化，以\n及主要资产和负债项目的变动情况，并且分析发生变化的原因。'
  },
  {
    title: '企业现金流分析',
    value: '请分析2024年第一季度现金流报告，包括现金流入和流出的具体情况，以及现金余额的变化情况，请根据现金流 \n分析结果，提出资金管理优化的建议。'
  },
  {
    title: '企业销售收入分析',
    value: '请分析2024年第一季度销售业绩数据，包括总销售额、各产品或服务的销售额、销售增长率等，包括自主产品， \n服务化业务，行业解决方案营业收入，毛利，毛利率对比分析。'
  }
]
type InitPageProps = {
  onPromptClick: (item: UserPrompt) => void
  setSendValue?: (value: string) => void
}
export default function InitPage({ onPromptClick, setSendValue }: InitPageProps) {
  const location = useLocation()
  const [initPrologue, setInitPrologue] = useState<PrologueInfo>()
  // 记录当前菜单key
  const [menuKey, setMenuKey] = useState(0)
  // 获取开场白信息
  useEffect(() => {
    const pathname = location.pathname
    setMenuKey(menuWarp[pathname])
    const getData = async () => {
      const res = await getMenuPrologue(menuWarp[pathname])
      if (!res.data) return
      setInitPrologue(res.data)
    }
    getData()
  }, [location.pathname])
  return initPrologue ? (
    <div className="init_page animate__animated animate__fadeIn animate__faster">
      <div className="title-box">
        <p className="title">{titleWarp[initPrologue?.menu]}</p>
        <p className="sub-title"> {initPrologue?.content} </p>
      </div>
      <div className="flex">
        {/* left */}
        <div className="example relative mr-20">
          <h3 className=" font-semibold text-base mb-5">试试以下例子：</h3>
          {initPrologue &&
            initPrologue.examples.map((item) => {
              return (
                <p
                  dangerouslySetInnerHTML={{
                    __html: item.replaceAll('\n', '<br/>')
                  }}
                  onClick={() => onPromptClick({ ...initPrologue, title: item, prologue: initPrologue?.content, content: item })}
                  key={item}
                  title={item}
                  className="mb-2 hover:text-blue-500"
                ></p>
              )
            })}
        </div>
        {/* 临时工作区 */}
        {menuKey === 3 && (
          <div className="example relative">
            <h3 className=" font-semibold text-base mb-5">我的工作区</h3>
            {TemporaryWorkingArea &&
              TemporaryWorkingArea.map((item, index) => {
                return (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: item.title
                    }}
                    onClick={() => setSendValue!(item.value)}
                    key={index}
                    title={item.value}
                    className="mb-2 hover:text-blue-500"
                  ></p>
                )
              })}
          </div>
        )}
      </div>
    </div>
  ) : null
}
