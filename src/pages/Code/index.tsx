import History from '@/components/history'
import React from 'react'
import './index.css'
export default function Code() {
  return (
    <div className="code">
      <History title="代码沙盒" title_Icon={true} />
      <div className="code-container">
        <div className="code-box">
          <div className="title-box">
            <p className="title">代码编程助手</p>
            <p className="sub-title"> 我是您的软件编程助手，您可以输入任何编程的需求或者指令，我能够帮您生成对应的软件代码，开始体验吧。 </p>
          </div>
        </div>
      </div>
    </div>
  )
}
