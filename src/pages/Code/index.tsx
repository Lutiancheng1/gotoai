import History from '@/components/history'
import React from 'react'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { talkInitialState } from '@/store/reducers/talk'
type Props = {} & Partial<talkInitialState>
const Code = ({ isNewChat, loading }: Props) => {
  return (
    <div className="code relative">
      <History title="代码沙盒" title_Icon={true} />
      <div className="code-container">
        <div className="code-box">
          {isNewChat && <InitPage />}
          <Dialogue />
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
