import React from 'react'
import History from '@/components/history'
import './index.css'
export default function Video() {
  return (
    <div className="video">
      <History />
      <div className="video-container">
        <div className="video-box">
          <div className="title-box">
            <p className="title">视频助手</p>
            <p className="sub-title"> 我是企业内部的视频生成助手，能够根据您的要求生成满意的短视频，立即开始体验吧。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
