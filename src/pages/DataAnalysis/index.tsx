import React from 'react'
import './index.css'
import History from '@/components/history'
export default function DataAnalysis() {
  return (
    <div className="data-analysis">
      <History />
      <div className="analysis-container">
        <div className="analysis-box">
          <div className="title-box">
            <p className="title">数据分析助手</p>
            <p className="sub-title"> 我是您的数据分析助手，通过分析您上传文件或数据说明，帮助您分析数据并提供图表化的能力。也可通过简单的编码完成文件处理的工作。 </p>
          </div>
        </div>
      </div>
    </div>
  )
}
