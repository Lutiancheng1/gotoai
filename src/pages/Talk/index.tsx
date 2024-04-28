import React, { useEffect, useRef, useState } from 'react'
import { Layout, ConfigProvider } from 'antd'
import './index.css'
import { promptConfig } from '@/utils/constants'
import History from '@/components/history'
import { PrologueInfo } from '@/store/types'
import Loading from '@/components/loading'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { talkInitialState } from '@/store/reducers/talk'
import { getPrologue, getMenuPrologue } from '@/api/prologue'
import { ipInCN } from '@/utils'
import Dialogue from '@/components/Dialogue'
import { getUserPrompts } from '@/api/prompt'
// 定义一个文件信息的类型
type FileInfo = {
  // 文件的 id
  file_id: string
  // 文件的名称
  file_name: string
  // 文件的大小
  file_size: number | string
  // 文件的 url
  file_url: string
  // 文件的高度
  height: number
  // 文件的宽度
  width: number
  // 文件的头缀
  type: string
}

export type UserPrompt = {
  id: number
  categoryid?: number
  title: string
  prologue: string
  status: number
  example?: any
  content: string
}
/**
 * Renders the talk component with chat history, input box, and file upload feature.
 *
 * @param {Props} loading - Indicates whether the component is in a loading state.
 * @param {Props} currentId - The current ID of the conversation.
 * @param {Props} conversitionDetailList - The list of conversation details.
 * @param {Props} isNewChat - Indicates whether it is a new chat session.
 * @return {ReactNode} The rendered talk component.
 */

type Props = {} & Partial<talkInitialState>
const Talk: React.FC<Props> = ({ isNewChat, currentConversation }) => {
  // 存储开场白信息
  const [prologue, setPrologue] = useState<PrologueInfo>()
  // 当前用户推荐提词
  const [userPrompt, setUserPrompt] = useState<UserPrompt[]>([])
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void> }>()
  // 获取开场白信息
  useEffect(() => {
    /**
     * Retrieve data asynchronously, set prologue, and user prompts.
     */
    const getData = async () => {
      const res = await getMenuPrologue(0)
      res.data && setPrologue(res.data)
      const resp = await getUserPrompts()
      resp.data && setUserPrompt(resp.data)
    }
    getData()
  }, [])

  useEffect(() => {
    console.log(currentConversation, 'currentId变化了')
  }, [currentConversation])

  // 点击提词
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(true, item)
  }

  useEffect(() => {
    // ipInCN()
  }, [])
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: '#fff',
            // headerBg: '#fff',
            triggerBg: '#fff',
            triggerColor: '#606773',
            triggerHeight: 80
          },
          Menu: {
            itemHeight: 60,
            // itemSelectedColor: '#dcddde',
            itemSelectedBg: '#dcddde',
            itemSelectedColor: '#212936',
            iconSize: 32
          },
          Input: {
            activeShadow: ''
          }
        }
      }}
    >
      <Layout>
        <div className="home relative">
          <History />
          <div className="detail">
            {isNewChat && prologue && userPrompt && (
              <div className="init-page animate__animated animate__fadeIn animate__faster">
                <div className="warp">
                  <div className="inner">
                    <div className="init-header">
                      <div className="init-title">AI 智能助理</div>
                    </div>
                    <div className="init-content">
                      <p>{prologue?.content}</p> <p>&nbsp;</p>
                    </div>
                    <div className="init-prompt">
                      <div className="prompt-title">{prologue?.examples[0]}</div>
                      <div className="prompt-content">
                        {userPrompt.map((item, index) => {
                          return (
                            <span key={item.id} onClick={() => onPrompt(item)} title={item.prologue} className="hover:text-blue-500">
                              {item.title} {index !== userPrompt.length - 1 ? <span className="shuxian">|</span> : ''}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Dialogue ref={dialogueRef} sse={true} />
          </div>
        </div>
      </Layout>
    </ConfigProvider>
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
const ConnectedTalk = connect(mapStateToProps, mapDispatchToProps)(Talk)

export default ConnectedTalk
