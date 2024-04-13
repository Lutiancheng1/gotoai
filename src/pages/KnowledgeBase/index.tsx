import History from '@/components/history'
import React, { useRef } from 'react'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
import { talkInitialState } from '@/store/reducers/talk'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { UserPrompt } from '../Talk'
type Props = {} & Partial<talkInitialState>
const KnowledgeBase = ({ isNewChat }: Props) => {
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void> }>()
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(false, item)
  }
  return (
    <div className="knowledge_base">
      <History />
      <div className="knowledge-container">
        <div className="knowledge-box">
          {isNewChat && <InitPage onPromptClick={onPrompt} />}
          <Dialogue ref={dialogueRef} />
        </div>
      </div>
    </div>
  )
}

// mapStateToProps 函数：将 state 映射到 props
function mapStateToProps(state: RootState) {
  return state.talkSlice
}

// mapDispatchToProps 函数：将 dispatch 映射到 props
function mapDispatchToProps(dispatch: AppDispatch) {
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedKnowledgeBase = connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase)

export default ConnectedKnowledgeBase
