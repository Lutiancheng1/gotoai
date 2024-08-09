import { ConfigProvider, Tabs } from 'antd'
import './index.css'
import { Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Loading from '@/components/loading'
import React from 'react'
const CreateDoc = React.lazy(() => import('./components/CreateDoc'))
const WriteTopic = React.lazy(() => import('./components/WriteTopic'))
const MyDoc = React.lazy(() => import('./components/MyDoc'))
const Knowledge = React.lazy(() => import('./components/Knowledge'))
const tabsWarp = [
  {
    label: '新建文档',
    key: 'createDoc',
    path: '/writeDoc/createDoc'
  },
  {
    label: '写作选题',
    key: 'writeTopic',
    path: '/writeDoc/writeTopic',
    disabled: true
  },
  {
    label: '我的文档',
    key: 'myDoc',
    path: '/writeDoc/myDoc'
  },
  {
    label: '知识库',
    key: 'knowledge',
    path: '/writeDoc/knowledge'
  }
]
type TabType = 'createDoc' | 'writeTopic' | 'myDoc' | 'knowledge'
export default function WritingDoc() {
  const [activeKey, setActiveKey] = useState<TabType>('createDoc')
  const navagate = useNavigate()
  const location = useLocation()
  const menuGo = async (key: string) => {
    navagate(`${key}`)
  }

  useEffect(() => {
    const currentPath = location.pathname
    const currentTab = tabsWarp.find((tab) => currentPath.startsWith(tab.path))
    if (currentTab) {
      setActiveKey(currentTab.key as TabType)
    }
  }, [location.pathname])
  return (
    <div className="write_doc_warpper">
      {/* 上方tab切换*/}
      <section className="write-tabs bg-white">
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
          <Tabs
            className="font-500"
            style={{ height: '46px' }}
            activeKey={activeKey}
            items={tabsWarp}
            onTabClick={(key) => {
              setActiveKey(key as TabType)
              menuGo(key)
            }}
          />
        </ConfigProvider>
      </section>
      {/* 下方内容区域 */}
      <div className="write-content w-full h-[calc(100%-46px)] overflow-auto nw-scrollbar">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/createDoc" element={<CreateDoc />} />
            <Route path="/writeTopic" element={<WriteTopic />} />
            <Route path="/myDoc" element={<MyDoc />} />
            <Route path="/knowledge" element={<Knowledge />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}
