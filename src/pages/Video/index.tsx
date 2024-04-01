import React from 'react'
import History from '@/components/history'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
export default function Video() {
  return (
    <div className="video">
      <History />
      <div className="video-container">
        <div className="video-box">
          <InitPage />
          <Dialogue isNewChat={true} conversitionDetailList={[]} />
        </div>
      </div>
    </div>
  )
}
