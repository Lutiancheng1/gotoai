import { ConfigProvider, Tabs } from 'antd'
import React, { useState } from 'react'
import TextTranslation from './TextTranslation'
import DocumentTranslation from './DocumentTranslation'
import './index.css'
const tabsWarp = [
  {
    label: 'AI 文本翻译',
    key: 'textTranslation'
  },
  {
    label: 'AI 文档翻译',
    key: 'documentTranslation'
  }
]

const TranslateWarp: React.FC<{}> = () => {
  const [activeKey, setActiveKey] = useState<'textTranslation' | 'documentTranslation'>('textTranslation')
  return (
    <div className="translate_warpper">
      {/* 上方tab切换*/}
      <section className="translate-tabs bg-white flex justify-start">
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
          <Tabs className="font-500" style={{ height: '46px' }} activeKey={activeKey} items={tabsWarp} onTabClick={(key) => setActiveKey(key as 'textTranslation' | 'documentTranslation')} />
        </ConfigProvider>
      </section>
      {/* 下方内容区域 */}
      <div className="translate-content w-full h-[calc(100%-46px)] overflow-auto nw-scrollbar">
        {activeKey === 'textTranslation' && <TextTranslation />}
        {activeKey === 'documentTranslation' && <DocumentTranslation />}
      </div>
    </div>
  )
}
export default TranslateWarp
