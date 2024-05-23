import { ConfigProvider, Tabs } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import './index.css'
import * as echarts from 'echarts'
const tabsWarp = [
  {
    label: 'AI 客服数据看板',
    key: 'aiCustomerServiceViewBoard'
  },
  {
    label: 'AI 客服跟进',
    key: 'aiCustomerServiceFollowUp',
    disabled: true
  },
  {
    label: 'AI 客户查询',
    key: 'aiCustomerQuery',
    disabled: true
  },
  {
    label: 'AI 客户跟进历史',
    key: 'aiCustomersFollowUpHistory',
    disabled: true
  }
]
type SmartCustomerServiceWrapperProps = {}
type EChartsOption = echarts.EChartsOption

let eventChartOption: EChartsOption
let channelChartOption: EChartsOption
let progressChartOption: EChartsOption
eventChartOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    }
  },
  title: {
    text: 'AI 客户诉求看板',
    textAlign: 'center',
    left: '50%',
    top: '5%',
    textStyle: {
      fontSize: 14
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月', '六月']
  },
  series: [
    {
      name: '购买',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [25, 21, 23, 56, 37, 0]
    },
    {
      name: '意向',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [112, 121, 145, 186, 125, 0]
    },
    {
      name: '投诉',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [0, 0, 0, 0, 0]
    },
    {
      name: '咨询',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [231, 221, 256, 267, 198, 0]
    },
    {
      name: '售后',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [20, 18, 23, 35, 31, 0]
    },
    {
      name: '反馈',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [12, 10, 14, 17, 23, 0]
    }
  ]
}
channelChartOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    }
  },
  legend: {},
  title: {
    text: 'AI 客服渠道看板',
    textAlign: 'center',
    left: '50%',
    top: '5%',
    textStyle: {
      fontSize: 14
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月', '六月']
  },
  series: [
    {
      name: '官网AI客服',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [298, 315, 322, 388, 298, 0]
    },
    {
      name: '微信',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [42, 5, 8, 25, 25, 0]
    },
    {
      name: 'App',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [0, 0, 0, 0, 0]
    },
    {
      name: '小程序',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [35, 41, 55, 58, 36, 0]
    },
    {
      name: '400电话',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [25, 30, 76, 90, 55, 0]
    }
  ]
}
progressChartOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    }
  },
  legend: {},
  title: {
    text: 'AI 客服进度看板',
    textAlign: 'center',
    left: '50%',
    top: '5%',
    textStyle: {
      fontSize: 14
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月', '六月']
  },
  series: [
    {
      name: '购买',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [25, 21, 23, 56, 37, 0]
    },
    {
      name: '意向',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [112, 121, 145, 186, 125, 0]
    },
    {
      name: '投诉',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [0, 0, 0, 0, 0]
    },
    {
      name: '咨询',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [231, 221, 256, 267, 198, 0]
    },
    {
      name: '售后',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [20, 18, 23, 35, 31, 0]
    },
    {
      name: '反馈',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [12, 10, 14, 17, 23, 0]
    }
  ]
}

const SmartCustomerServiceWrapper: React.FC<SmartCustomerServiceWrapperProps> = () => {
  const [activeKey, setActiveKey] = useState('aiCustomerServiceViewBoard')
  const eventChartRef = useRef<HTMLDivElement>(null)
  const channelChartRef = useRef<HTMLDivElement>(null)
  const progressChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (eventChartRef.current && channelChartRef.current && progressChartRef.current) {
      let myEventChart = echarts.init(eventChartRef.current)
      let myChannelChart = echarts.init(channelChartRef.current)
      let myProgressChart = echarts.init(progressChartRef.current)

      myEventChart.setOption(eventChartOption)
      myChannelChart.setOption(channelChartOption)
      myProgressChart.setOption(progressChartOption)
    }
  }, [])
  return (
    <div className="customer_service h-full">
      {/* 上方tab切换*/}
      <section className="customer-tabs bg-white flex justify-start">
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                /* 这里是你的组件 token */
                inkBarColor: '#dcddde',
                itemActiveColor: '#1a2029',
                itemSelectedColor: '#1a2029',
                itemHoverColor: '',
                horizontalMargin: '0px',
                titleFontSize: 20,
                horizontalItemPadding: '8px',
                itemColor: 'rgba(0, 0, 0, 0.25)'
              }
            }
          }}
        >
          <Tabs className="font-600" style={{ height: '46px' }} activeKey={activeKey} items={tabsWarp} onTabClick={(key) => setActiveKey(key)} />
        </ConfigProvider>
      </section>
      {/* 下方内容区域 */}
      <div className="smart_customer_service w-full h-[calc(100vh-46px)] p-3">
        <div className="mt-1 mb-2">统一集成全网营销渠道，网站AI客服机器人，微信，App, 小程序，400电话，抖音等其他引流媒介，快速触达并留住潜在客户，专注提升问题解决率，超越真人的服务体验，真正实现客户自助服务，想你所想，答你所问，智能 AI 真非同凡响，让企业客户服务效率飞起来。</div>
        {activeKey === 'aiCustomerServiceViewBoard' && (
          <div className="w-full h-[calc(100%-46px-42px)] flex flex-col">
            <div className="flex-1 flex h-full mb-1 border-b">
              {/* 事件图表 */}
              <div ref={eventChartRef} className="border-r h-full w-[50%] p-3"></div>
              {/* 渠道图表 */}
              <div ref={channelChartRef} className="h-full w-[50%] p-3"></div>
            </div>
            {/* 进度图表 */}
            <div className="flex-1 h-full">
              <div className="w-[50%] h-full border-r p-3" ref={progressChartRef}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SmartCustomerServiceWrapper
