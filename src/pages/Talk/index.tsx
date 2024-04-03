import React, { useEffect, useState } from 'react'
import { Layout, ConfigProvider } from 'antd'
import './index.css'
import { promptConfig } from '@/utils/constants'
import initLogo from '@/assets/images/test-logo.png'
import History from '@/components/history'
import { PrologueInfo } from '@/store/types'
import Loading from '@/components/loading'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { talkInitialState } from '@/store/reducers/talk'
import { getPrologue, getMenuPrologue } from '@/api/prologue'
import { ipInCN } from '@/utils'
import Dialogue from '@/components/Dialogue'
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
const Talk: React.FC = ({ loading, currentId, conversitionDetailList, isNewChat }: Props) => {
  // 存储开场白信息
  const [prologue, setPrologue] = useState<PrologueInfo>()
  // 获取开场白信息
  useEffect(() => {
    const getData = async () => {
      const res = await getMenuPrologue(0)
      if (!res.data) return
      setPrologue(res.data[0])
    }
    getData()
  }, [])

  useEffect(() => {
    console.log(currentId, 'currentId变化了')
  }, [currentId])

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
          {loading && (
            <div id="mask" className="w-full h-full opacity-30" style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}>
              <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <Loading></Loading>
              </div>
            </div>
          )}
          <History history_list={[]} />
          <div className="detail">
            {isNewChat && prologue && (
              <div className="init-page animate__animated animate__fadeIn animate__faster">
                <div className="warp">
                  <div className="inner">
                    <div className="init-header">
                      <div className="init-logo">
                        <img src={initLogo} alt="" />
                      </div>
                      <div className="init-title">GotoAI 智能助理</div>
                    </div>
                    <div className="init-content">
                      <p>{prologue?.content}</p> <p>&nbsp;</p>
                    </div>
                    <div className="init-prompt">
                      <div className="prompt-title">{prologue?.example}</div>
                      <div className="prompt-content">
                        {promptConfig &&
                          promptConfig.map((item, index) => {
                            return (
                              <span key={index}>
                                {item} {index !== promptConfig.length - 1 ? <span className="shuxian">|</span> : ''}
                              </span>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Dialogue />
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
