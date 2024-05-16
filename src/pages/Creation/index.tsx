import { ConfigProvider, Tabs } from 'antd'
import './index.css'
import React, { useState } from 'react'
import VideoCreation from './VideoCreation'
import VideoEditing from './VideoEditing'
import MusicCreation from './MusicCreation'
type CreationWrapperProps = {}
const tabsWarp = [
  {
    label: 'AI 视频创作',
    key: 'videoCreation'
  },
  {
    label: 'AI 视频剪辑',
    key: 'videoEditing',
    disabled: true
  },
  {
    label: 'AI 音乐创作',
    key: 'musicCreation',
    disabled: true
  }
]
const CreationWrapper: React.FC<CreationWrapperProps> = () => {
  const [activeKey, setActiveKey] = useState('videoCreation')
  return (
    <div className="creation_wrapper">
      {/* 上方tab切换*/}
      <section className="creation-tabs bg-white flex justify-start">
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                /* 这里是你的组件 token */
                inkBarColor: '#dcddde',
                itemActiveColor: '',
                itemSelectedColor: '',
                itemHoverColor: '',
                horizontalMargin: '0px'
              }
            }
          }}
        >
          <Tabs activeKey={activeKey} items={tabsWarp} onTabClick={(key) => setActiveKey(key)} />
        </ConfigProvider>
      </section>
      {/* 下方内容区域 */}
      <div className="creation-content w-full h-[calc(100%-46px)] p-3">
        {activeKey === 'videoCreation' && <VideoCreation />}
        {activeKey === 'videoEditing' && <VideoEditing />}
        {activeKey === 'musicCreation' && <MusicCreation />}
      </div>
    </div>
  )
}
export default CreationWrapper
