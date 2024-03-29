import History from '@/components/history'
import React from 'react'
import './index.css'
export default function KnowledgeBase() {
  return (
    <div className="knowledge_base">
      <History />
      <div className="knowledge-container">
        <div className="knowledge-box">
          <div className="title-box">
            <p className="title">知识库助手</p>
            <p className="sub-title"> 我是利用企业内部私有数据构建，学习和训练后生成的企业级AI智能体，为每位员工提供包括文档检索，知识问答，员工自助服务，业务流程相关的智能体服务，立即开始体验吧。 </p>
          </div>
        </div>
      </div>
    </div>
  )
}
