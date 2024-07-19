import History from '@/components/history'
import React, { useRef } from 'react'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue_agent'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { talkInitialState } from '@/store/reducers/talk'
import { UserPrompt } from '../Talk'
import { PrologueInfo } from '@/store/types'
type Props = {} & Partial<talkInitialState>
const Code = ({ isNewChat, loading }: Props) => {
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void> }>()
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(false, item)
  }
  return (
    <div className="code relative">
      <History title="代码沙盒" title_icon={true} />
      <div className="code-container">
        <div className="code-box">
          {isNewChat && <InitPage onPromptClick={onPrompt} />}
          <Dialogue ref={dialogueRef} hasUploadBtn={false} sse={true} />
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
const ConnectedCode = connect(mapStateToProps, mapDispatchToProps)(Code)

export default ConnectedCode
