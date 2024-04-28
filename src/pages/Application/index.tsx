import History from '@/components/history'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { clearConversitionDetailList, talkInitialState, toggleIsNewChat, updateCurrentId } from '@/store/reducers/talk'
import { useEffect, useRef, useState } from 'react'
import { UserPrompt } from '../Talk'
import { getPromptList, getPromptTypes } from '@/api/prompt'
import Dialogue from '@/components/Dialogue'
import './index.css'
import itemIcon from '@/assets/images/ai-icon.svg'
import backIcon from '@/assets/images/back.svg'
import { useAppDispatch } from '@/store/hooks'
import { FloatButton } from 'antd'
import { useBoolean, useMount } from 'ahooks'
import Loading from '@/components/loading'
import { PrologueInfo } from '@/store/types'
import { getMenuPrologue } from '@/api/prologue'
import { menuWarp } from '@/utils/constants'
import { useLocation } from 'react-router-dom'
type PromptList = {
  id: number
  title: string
  status: number
  sorts: number
  deptid: number
  desc: string
}[]

type Props = {} & Partial<talkInitialState>
const Application: React.FC = ({ isNewChat }: Props) => {
  const dispatch = useAppDispatch()
  const [loadingState, setLoadingState] = useBoolean(false)
  // 提词分类列表
  const [promptList, setPromptList] = useState<PromptList>()
  // 当前选中的prompt分类
  const [currentPromptType, setCurrentPromptType] = useState<number>()
  // 当前提词分类列表下的提词list
  const [currentPromptList, setCurrentPromptList] = useState<UserPrompt[]>([])
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void> }>()
  const [initPrologue, setInitPrologue] = useState<PrologueInfo>()
  const location = useLocation()
  // 获取应用分类列表
  // 获取应用分类详细数据
  useEffect(() => {
    const getData = async () => {
      const res = await getPromptTypes()
      if (res.data) {
        setPromptList(res.data)
        setCurrentPromptType(res.data[0].id)
        menuClick(res.data[0].id)
      }
    }
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 点击提词

  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(true, item)
  }
  const menuClick = async (id: number) => {
    if (id === currentPromptType) return
    setLoadingState.setTrue()
    setCurrentPromptType(id)
    const resp = await getPromptList(id)
    resp.data && setCurrentPromptList(resp.data)
    setLoadingState.setFalse()
  }
  const back = () => {
    dispatch(toggleIsNewChat(true))
    dispatch(clearConversitionDetailList())
    dispatch(
      updateCurrentId({
        chatId: 0,
        conversationId: ''
      })
    )
  }
  useMount(async () => {
    const res = await getMenuPrologue(menuWarp[location.pathname])
    if (!res.data) return
    setInitPrologue(res.data)
  })
  return (
    <div className="application">
      <History />
      <div className="application-container">
        {isNewChat && currentPromptList && initPrologue && (
          <div className="init-page animate__animated animate__fadeIn animate__faster">
            <div className="warp">
              <div className="inner">
                <div className="init-header">
                  <div className="init-title">AI应用助手</div>
                </div>
                <div className="init-content">
                  <p>{initPrologue.content}</p>
                </div>
                <div className="init-prompt">
                  <ul className="prompt-menu menu menu-vertical lg:menu-horizontal rounded-box">
                    {promptList &&
                      promptList.map((item) => {
                        return (
                          <li key={item.id} onClick={() => menuClick(item.id)}>
                            <button className={currentPromptType === item.id ? 'active' : ''}>
                              <span>|</span>
                              {item.title}
                            </button>
                          </li>
                        )
                      })}
                  </ul>
                  <div className="prompt-list relative">
                    {loadingState && (
                      <div id="mask" className="w-full h-full opacity-30" style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}>
                        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                          <Loading />
                        </div>
                      </div>
                    )}
                    {currentPromptList &&
                      currentPromptList.map((item) => {
                        return (
                          <div
                            className="prompt-item"
                            key={item.id}
                            onClick={() => {
                              onPrompt(item)
                            }}
                            title={item.prologue}
                          >
                            <img src={itemIcon} alt="" />
                            <p className="hover:text-blue-500">{item.title}</p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Dialogue ref={dialogueRef} style={{ display: !isNewChat ? 'flex' : 'none' }} />
      </div>
      {!isNewChat && <FloatButton style={{ bottom: '50%', transform: 'translateY(-50%)' }} icon={<img src={backIcon} alt="" />} tooltip={'返回应用中心'} onClick={() => back()} />}
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
const ConnectedApplication = connect(mapStateToProps, mapDispatchToProps)(Application)

export default ConnectedApplication
