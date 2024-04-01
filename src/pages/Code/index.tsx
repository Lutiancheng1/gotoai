import History from '@/components/history'
import React from 'react'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
export default function Code() {
  return (
    <div className="code">
      <History title="代码沙盒" title_Icon={true} />
      <div className="code-container">
        <div className="code-box">
          <InitPage />
          <Dialogue isNewChat={true} conversitionDetailList={[]} />
        </div>
      </div>
    </div>
  )
}
