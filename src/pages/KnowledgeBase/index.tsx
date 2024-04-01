import History from '@/components/history'
import React from 'react'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
export default function KnowledgeBase() {
  return (
    <div className="knowledge_base">
      <History />
      <div className="knowledge-container">
        <div className="knowledge-box">
          <InitPage />
          <Dialogue isNewChat={true} conversitionDetailList={[]} />
        </div>
      </div>
    </div>
  )
}
