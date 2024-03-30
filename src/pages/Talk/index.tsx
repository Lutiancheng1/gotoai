import React, { useEffect, useRef, useState } from 'react'
import { Layout, ConfigProvider, Tooltip } from 'antd'
import dayjs from 'dayjs'
import './index.css'
import TextArea from 'antd/es/input/TextArea'
import { menuType, menuWarp, promptConfig } from '@/utils/constants'
import Toast from '@/components/toast'
import { sendMessageToAi, StreamGpt } from '@/api/openai'
import { parsePack, Typewriter } from '@/utils/format'
import sendIcon from '@/assets/images/send.svg'
import initLogo from '@/assets/images/test-logo.png'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'
import { addNewConversition } from '@/api/chat'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import History from '@/components/history'
import chatAPi from '@/api/chat/index'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useLocation } from 'react-router-dom'
import { MessageInfo } from '@/store/types'
import { addMessages, createChat, getHistoryList } from '@/store/action/talkActions'
import Loading from '@/components/loading'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { clearHistoryList, talkInitialState, toggleIsNewChat, updateCurrentId } from '@/store/reducers/talk'
import { debounce } from 'radash'
import { getPrologue, getMenuPrologue } from '@/api/prologue'
import { ipInCN } from '@/utils'
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

type Props = {} & Partial<talkInitialState>
const Talk: React.FC = ({ loading, currentId, conversitionDetailList, isNewChat }: Props) => {
  // 初始化问题Id
  let questionId = currentId || Date.now()
  // const location = useLocation()
  // 获取 dispatch 对象，用于触发 actions
  const dispatch = useAppDispatch()
  // 初始化输入框的值
  const [sendValue, setSendValue] = useState('')
  // 判断是否在加载消息
  const [messageLoading, setMessageLoading] = useState(false)
  // 获取服务器响应的消息
  const [respText, setRespText] = useState('')
  // 创建一个滚动框
  const scrollBox = useRef<HTMLDivElement>(null)
  // 创建一个内框
  const innerBox = useRef<HTMLDivElement>(null)
  // 创建一个上传组件
  const uploadRef = useRef<HTMLInputElement>(null)
  // 初始化文件列表
  const [fileList, setFileList] = useState([] as FileInfo[])
  // 用于处理流式传输的数据
  const streamingText = useRef('')
  //  store
  const user = useAppSelector((state) => state.profileSlice.user)
  // 存储开场白信息
  const [prologue, setPrologue] = useState<{
    content: string
    example: string
    id: number
    menu: number
    status: number
  }>()
  const sendMessage = async () => {
    // 如果消息正在加载中，则直接返回
    if (messageLoading) return
    // 将输入框的内容发送给服务器
    setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
    // 如果输入框为空，则提示用户输入内容
    if (!sendValue && !sendValue.trim()) {
      return Toast.notify({ type: 'info', message: '请输入内容' })
    }

    // 如果是新会话，则创建一个新的会话
    if (isNewChat) {
      const { payload } = await dispatch(
        createChat({
          id: 0,
          title: sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
          userId: user.id,
          createTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          updateTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          model: '',
          menu: 0
        })
      )
      questionId = payload
      console.log('是新会话,创建一个新会话 ID为:', payload)
      console.log(questionId, '更新questionId为新会话id')
    }
    // 创建一个 Typewriter 实例
    const typewriter = new Typewriter((str: string) => {
      // 将输入的内容添加到流中
      streamingText.current += str
      console.log('str', str)
      console.log('+++', streamingText.current)
    })
    // 创建一个 StreamGpt 实例
    const gpt = new StreamGpt({
      // 开始时，将内容添加到流中
      async onStart([{ content }]) {
        dispatch(toggleIsNewChat(false))
        // 将内容发送给服务器
        const resp = await dispatch(
          addMessages([
            {
              id: 0,
              chatId: questionId,
              content: content.replace(/\r/gi, '').replace(/\n/gi, ''),
              type: 0,
              resource: ''
            }
          ])
        )
        console.log(resp, '开始，user')
        setMessageLoading(true)
      },
      // 创建时，启动 Typewriter
      onCreated() {
        typewriter.start()
        // 获取历史列表
        dispatch(getHistoryList({ menu: 0, page: 1, pageSize: 10 }))
        // 更新当前 ID
        dispatch(updateCurrentId(questionId))
      },
      // 更新时，将内容添加到流中
      onPatch(text, reduceText) {
        typewriter.add(text)
        setRespText(reduceText)
      },
      // 完成时，将消息加载完成
      async onDone(text) {
        setMessageLoading(false)
        setSendValue('')
        typewriter.done()
        if (text === 'Failed to fetch') {
          ipInCN()
          return Toast.notify({ type: 'error', message: '网络错误' })
        }
        if (text === '请求频繁，请稍后再试') return Toast.notify({ type: 'error', message: '请求频繁，请稍后再试' })
        streamingText.current = ''
        console.log(text, '结束了，AI')

        // 将内容发送给服务器
        await dispatch(
          addMessages([
            {
              id: 0,
              chatId: questionId,
              content: text,
              type: 1,
              resource: ''
            }
          ])
        )
        // 滚动到底部
        scrollBox.current?.scrollTo({
          top: scrollBox.current!.scrollTop + 100000000000000000,
          behavior: 'smooth'
        })
        // scrollBox.current!.scrollTop = innerBox.current!.scrollHeight
      }
    })

    // 开始与 AI 对话
    gpt.stream([
      {
        role: 'user',
        content: sendValue
      }
    ])
  }

  // 定义enterMessage函数，接收一个React.KeyboardEvent<HTMLTextAreaElement>类型的参数e
  const enterMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果正在加载页面，则返回
    if (loading) return
    // 如果按下的是回车键
    if (e.keyCode === 13) {
      // 如果输入框为空
      if (!sendValue.trim()) {
        // 去除输入框中的回车和换行符
        setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
        // 弹出提示框，提示需要输入内容
        return Toast.notify({ type: 'info', message: '请输入内容' })
      } else {
        // 发送消息
        sendMessage()
        // 清空输入框
        setSendValue('')
      }
    }
  }
  const uploadHandle = (e: React.ChangeEvent<HTMLInputElement> | undefined) => {
    if (fileList.length > 10) return Toast.notify({ type: 'info', message: '最多上传十个文件' })
    const files = e!.target.files
    console.log(files)
    if (files!.length <= 1) {
      setFileList([
        ...fileList,
        {
          file_id: 'chatglm4/48efb6d2-6b3e-40ad-ba70-f63b60310844.jpeg' + files![0].lastModified,
          file_name: files![0].name,
          file_size: files![0].size / 1024 / 1024 > 1 ? parseInt((files![0].size / 1024 / 1024).toString()) + 'MB' : parseInt((files![0].size / 1024).toString()) + 'KB',
          file_url: 'https://sfile.chatglm.cn/chatglm4/48efb6d2-6b3e-40ad-ba70-f63b60310844.jpeg',
          height: 255,
          width: 198,
          type: files![0].type.split('/')[1] as string
        }
      ])
    } else {
      setFileList([
        ...fileList,
        {
          file_id: 'chatglm4/48efb6d2-6b3e-40ad-ba70-f63b60310844.jpeg' + files![0].lastModified,
          file_name: files![0].name,
          file_size: files![0].size / 1024 / 1024 > 1 ? parseInt((files![0].size / 1024 / 1024).toString()) + 'MB' : parseInt((files![0].size / 1024).toString()) + 'KB',
          file_url: 'https://sfile.chatglm.cn/chatglm4/48efb6d2-6b3e-40ad-ba70-f63b60310844.jpeg',
          height: 255,
          width: 198,
          type: files![0].type.split('/')[1] as string
        },
        ...(files as unknown as [])
      ])
    }
  }
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
    // scrollBox.current!.scrollTop = innerBox.current!.scrollHeight
    scrollBox.current?.scrollTo({
      top: scrollBox.current!.scrollTop + 100000000000000000,
      behavior: 'smooth'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversitionDetailList!?.length > 0])

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
            <div className="session-box" ref={scrollBox}>
              <div className="" ref={innerBox}>
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
                {!isNewChat &&
                  conversitionDetailList &&
                  conversitionDetailList.map((item, index) => {
                    return (
                      <div className="item" key={index}>
                        {item.type === 0 && (
                          <div className="chat chat-end">
                            <div className="chat-image avatar">
                              <div className="w-10 rounded-full">
                                <img alt="Tailwind CSS chat bubble component" src={defaultAvatar} />
                              </div>
                            </div>
                            <div className="chat-bubble ">{item.content}</div>
                          </div>
                        )}
                        {item.type === 1 && (
                          <div className="chat chat-start">
                            <div className="chat-image avatar">
                              <div className="w-10 rounded-full">
                                <img alt="Tailwind CSS chat bubble component" src={rebotAvatar} />
                              </div>
                            </div>
                            <div className="chat-bubble">{item.content}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
              {/* <div className="last-div"></div> */}
            </div>
            <div className="search-box animate__bounceInUp">
              <div className="search-container">
                <div className="search flex">
                  <div className="search-input-box">
                    {fileList && fileList.length > 0 && (
                      <div className="file-list-box">
                        {fileList.map((item) => {
                          return (
                            <div className="file-box" key={item.file_id}>
                              <div className="file">
                                <div className="icon icon-img" style={{ backgroundImage: `url("${item.file_url}")` }}></div>
                                <div className="file-info">
                                  <p className="name dot">{item.file_name}</p>
                                  <div className="status">
                                    <div className="success">
                                      <p className="type">{item.type}</p> <p className="size">{item.file_size}</p>
                                    </div>
                                  </div>
                                </div>
                                <p className="close" onClick={() => setFileList(fileList.filter((i) => i.file_id !== item.file_id))}></p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="input-wrap">
                      <div className="input-box-inner">
                        <TextArea wrap="off" value={sendValue} onKeyUp={(e) => enterMessage(e)} onChange={(e) => setSendValue(e.target.value)} placeholder="输入你的问题或需求" autoSize={{ minRows: 1, maxRows: 9 }} />
                      </div>
                      <div className="search-interactive">
                        <div className="upload-image-wrap">
                          <Tooltip title={'最多上传10个文件,每个文件不超过20M'}>
                            <input onChange={(e) => uploadHandle(e)} ref={uploadRef} type="file" style={{ display: 'none' }} multiple />
                            <div
                              className="upload-image-btn"
                              onClick={() => {
                                uploadRef.current?.click()
                              }}
                            ></div>
                          </Tooltip>
                        </div>
                        <div className="search-operation">
                          <div className={`enter ${messageLoading ? 'loading loading-spinner loading-xs' : ''}`} onClick={() => sendMessage()}>
                            <img src={sendIcon} alt="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="policy-wrap">
                  <a href="javscript:;" className="link ">
                    用户协议
                  </a>
                  &nbsp;
                  <span>&nbsp;|&nbsp;</span>&nbsp;
                  <a href="javscript:;" className="link">
                    隐私政策
                  </a>
                  &nbsp;
                  <span>© 2024 GotoAi 京公网安备111111111111号 </span>
                </div>
              </div>
            </div>
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
