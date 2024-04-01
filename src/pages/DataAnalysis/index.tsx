import React from 'react'
import './index.css'
import History from '@/components/history'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
export default function DataAnalysis() {
  return (
    <div className="data-analysis">
      <History />
      <div className="analysis-container">
        <div className="analysis-box">
          <InitPage />
          <Dialogue isNewChat={true} conversitionDetailList={[]} />
        </div>
      </div>
    </div>
  )
}
