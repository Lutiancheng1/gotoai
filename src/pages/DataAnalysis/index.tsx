import React, { useRef } from 'react'
import './index.css'
import History from '@/components/history'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue_agent'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { talkInitialState } from '@/store/reducers/talk'
import { UserPrompt } from '../Talk'
type Props = {} & Partial<talkInitialState>
const DataAnalysis = ({ isNewChat, loading }: Props) => {
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void> }>()
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(false, item)
  }
  return (
    <div className="data-analysis">
      <History />
      <div className="analysis-container">
        <div className="analysis-box">
          {isNewChat && <InitPage onPromptClick={onPrompt} />}
          <Dialogue ref={dialogueRef} hasUploadBtn={true} multiple={true} />
        </div>
      </div>
    </div>
  )
}

/**
 * mapStateToProps 函数：将 Redux 的 state 映射到组件的 props。
 *
 * @param {RootState} state - Redux 的 state 对象。
 * @returns {talkInitialState} - 包含了与对话相关的状态信息的对象。
 */
function mapStateToProps(state: RootState): talkInitialState {
  /**
   * 从 Redux 的 state 对象中提取与对话相关的状态信息，并将其作为 props 返回。
   *
   * @type {talkInitialState}
   */
  return state.talkSlice
}

/**
 * mapDispatchToProps 函数：将 dispatch 映射到组件的 props。
 *
 * @param {AppDispatch} dispatch - Redux 的 dispatch 函数。
 * @returns {{} | {[key: string]: any}} - 一个空对象，或者包含一些与组件相关的 dispatch 函数的对象。
 */
function mapDispatchToProps(dispatch: AppDispatch): {} | { [key: string]: any } {
  /**
   * 将 Redux 的 dispatch 函数映射到组件的 props 中，以便组件可以调用这些 dispatch 函数来更新 Redux 的状态。
   *
   * 注意：这里返回了一个空对象，因为 DataAnalysis 组件并没有需要 dispatch 的操作。
   * 如果该组件需要调用 dispatch 函数来更新状态，则应该在这里定义相应的 dispatch 函数，并将它们作为对象的属性返回。
   *
   * @example
   *
   * // 返回一个包含一些 dispatch 函数的对象
   * function mapDispatchToProps(dispatch: AppDispatch): { [key: string]: any } {
   *   return {
   *     fetchData: () => dispatch(fetchData()),
   *     updateState: (newState: Partial<State>) => dispatch(updateState(newState)),
   *   }
   * }
   */
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedDataAnalysis = connect(mapStateToProps, mapDispatchToProps)(DataAnalysis)

export default ConnectedDataAnalysis
