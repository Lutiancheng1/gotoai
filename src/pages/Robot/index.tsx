import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import './index.css'
import '@/components/Dialogue/index.css'
import '@/components/Search/index.css'
import Toast from '@/components/Toast'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { robotInitialState, toggleFirstSend, toggleIsNewChat, updateConversitionDetail, updateConversitionDetailList, updateCurrentId } from '@/store/reducers/robot'
import { addChatMessages, AddChatMessagesData, AddScore, CancelScore, startChat } from '@/store/action/robotActions'
import dayjs from 'dayjs'
import { Tooltip } from 'antd'
import copy from 'copy-to-clipboard'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'
import logo from '@/assets/images/logo.png'
import sendIcon from '@/assets/images/send.svg'
import { UserPrompt } from '@/pages/Talk'
import { useSize, useUpdateEffect } from 'ahooks'
import { ShartChatResp } from '@/types/app'
import { imgLazyload } from '@mdit/plugin-img-lazyload'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getTokenInfo } from '@/utils/storage'
import { UUID } from '@/utils/libs'
import TextArea from 'antd/es/input/TextArea'
import ExcelPreview from '@/components/Excel'
import WordPreview from '@/components/Docx'
import CSVPreview from '@/components/Csv'
import { handleCopyClick } from '@/components/Dialogue_agent'
import { getMessagesSuggested, sendChatMessage } from '@/api/knowledge'
import { getQuesions } from '@/store/action/talkActions'
import { renderMarkdown } from '@/components/MdRender/markdownRenderer'
import { MessageInfo } from '@/store/types'
import { REACT_APP_BASE_URL_CONFIG } from '@/config'
let conversation_id = ''
type Props = {
  right?: number
  bottom?: number
  onSendMessage?: (prompt: string, message: string) => void
  placeholder?: string
  autoToBottom?: boolean
  fileId?: string
  sse?: boolean
  hasFooter?: boolean
  style?: React.CSSProperties
  onClose?: () => void
} & Partial<robotInitialState>
const Robot: React.FC<Props> = ({ right = 20, bottom = 45, isNewChat, conversitionDetailList, currentConversation, style, placeholder = '输入你的问题或需求', autoToBottom = true, sse, onClose }) => {
  // 初始化问题Id
  let currentQuestion = currentConversation
  const user = useAppSelector((state: RootState) => state.profileSlice.user)
  // 获取 dispatch 对象，用于触发 actions
  const dispatch = useAppDispatch()
  // 初始化输入框的值
  const [sendValue, setSendValue] = useState('')
  // 判断是否在加载消息
  const [messageLoading, setMessageLoading] = useState(false)
  // 创建一个滚动框
  const scrollBox = useRef<HTMLDivElement>(null)
  // 创建一个内框
  const innerBox = useRef<HTMLDivElement>(null)
  // 联想词loading
  const [quesionsLoading, setQuesionsLoading] = useState(false)
  // 联想词内容
  const [quesions, setQuesions] = useState<string[]>([])
  const [currentUUID, setCurrentUUID] = useState('')
  const [controller, setController] = useState<AbortController>()
  const currentMessageRef = useRef<HTMLDivElement>(null)
  // 使用 useSize 监听 scrollBoxRef 元素的尺寸变化
  const size = useSize(currentMessageRef)

  const scrollBottom = () => {
    // 滚动到底部
    if (scrollBox.current) {
      scrollBox.current.scrollTo({
        top: scrollBox.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }
  const getConversationQuestions = async (id?: string) => {
    setQuesions([])
    try {
      setQuesionsLoading(true)
      const { payload } = await dispatch(getQuesions(currentQuestion!.conversationId ?? currentConversation?.conversationId))
      payload && setQuesions(payload as string[])
      // const { data } = (await getMessagesSuggested(id ?? '', user.username)) as { data: [] }
      // data && setQuesions(data as string[])
      setQuesionsLoading(false)
      setTimeout(() => {
        scrollBottom()
      }, 0)
    } catch (error) {
      setQuesionsLoading(false)
    }
  }
  const sendMessage = async () => {
    if (!sendValue.trim()) {
      // 去除输入框中的回车和换行符
      setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
      // 弹出提示框，提示需要输入内容
      return Toast.notify({ type: 'info', message: '请输入内容' })
    }
    // 如果消息正在加载中，则直接返回
    if (messageLoading) return Toast.notify({ type: 'info', message: '请等待上条信息响应完成' })
    // 将输入框的内容发送给服务器
    setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
    // 如果输入框为空，则提示用户输入内容
    sendBeta()
  }
  // 不使用 stream流 来发消息
  const sendBeta = async (defaultRule?: boolean, prompt?: UserPrompt) => {
    setQuesions([])
    // defaultRule 为 true 代表是从 首页预设角色过来的 只需要 传递prompt提词 不用发送用户消息
    // 如果是新会话，则创建一个新的会话
    // 创建一个新的会话
    if (isNewChat) {
      const { payload } = (await dispatch(
        startChat({
          menu: 8,
          prompt: '',
          promptId: 0,
          fileId: ''
        })
      )) as { payload: ShartChatResp }
      currentQuestion = payload
      // 获取历史列表
      // 更新当前 ID
      dispatch(updateCurrentId(currentQuestion as ShartChatResp))
      dispatch(toggleIsNewChat(false))
    }
    // 将内容发送给服务器
    // 预设角色不需要发送消息
    setMessageLoading(true)
    setSendValue('')
    let uuid = UUID()
    setCurrentUUID(uuid)
    // 更新发送次数
    await dispatch(
      updateConversitionDetailList(
        sse
          ? [
              {
                id: updateConversitionDetailList.length,
                chatId: currentConversation!.chatId,
                content: prompt?.content || sendValue,
                type: 0,
                resource: '',
                createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
              },
              {
                id: updateConversitionDetailList.length + 1,
                UUID: uuid,
                chatId: currentConversation!.chatId,
                content: '',
                isLoading: true,
                type: 1,
                resource: '',
                score: null,
                createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
              }
            ]
          : {
              id: 0,
              chatId: updateConversitionDetailList.length,
              content: prompt?.content || sendValue,
              type: 0,
              resource: '',
              createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
      )
    )
    // 滚动到底部
    scrollBottom()
    if (sse) {
      const newController = new AbortController()
      setController(newController)
      const signal = newController.signal
      try {
        const url = `${REACT_APP_BASE_URL_CONFIG.REACT_APP_BASE_URL}/Chat/ChatMessagesEvent`
        fetchEventSource(url, {
          method: 'POST',
          signal: signal,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            Authorization: `Bearer ${getTokenInfo().token}`
          },
          body: JSON.stringify({
            conversationId: currentQuestion!.conversationId,
            menu: 8,
            query: prompt?.content || sendValue
          }),
          onopen(response) {
            return Promise.resolve()
          },
          onmessage(msg) {
            // 接收一次数据段时回调，因为是流式返回，所以这个回调会被调用多次
            if (msg.event === 'message') {
              // 处理数据段
              let { message, files } = JSON.parse(msg.data) as unknown as AddChatMessagesData
              let file = files && files.length > 0 ? files.map((file) => (file.type === 'image' ? `![图片](${file.url})` : `[文件](${file.url})`)).join('\n\n') : ''
              dispatch(updateConversitionDetail({ UUID: uuid, content: message ? message + file : file }))
              // 进行连接正常的操作
            } else if (msg.event === 'message_end') {
              setMessageLoading(false)
              newController.abort()
              setCurrentUUID('')
              getConversationQuestions()
            }
          },
          onclose() {
            // 正常结束的回调
            newController.abort() // 关闭连接
          },
          onerror(err) {
            // 连接出现异常回调
            // 必须抛出错误才会停止
            throw err
          }
        })
        // await sendChatMessage(
        //   {
        //     inputs: {},
        //     query: prompt?.content || sendValue,
        //     conversation_id: conversation_id,
        //     user: user.username
        //   },
        //   {
        //     onData: (data, isFirstMessage, moreInfo) => {
        //       // console.log(data, isFirstMessage, moreInfo, 'data')
        //       // handle data
        //       dispatch(updateConversitionDetail({ UUID: uuid, content: data }))
        //     },
        //     onCompleted: () => {
        //       // handle completion
        //       setMessageLoading(false)
        //       newController.abort()
        //       setCurrentUUID('')
        //     },
        //     onFile: (file) => {
        //       // handle file
        //     },
        //     onThought: (thought) => {
        //       // handle thought
        //       console.log(thought, 'thought')
        //     },
        //     onMessageEnd: ({ message_id, conversation_id: id }) => {
        //       // handle message end
        //       conversation_id = id
        //       getConversationQuestions(message_id)
        //     },
        //     onMessageReplace: (message) => {
        //       // handle message replace
        //       console.log(message, 'message')
        //     },
        //     onError: (error) => {
        //       // handle error
        //       setMessageLoading(false)
        //       newController.abort()
        //       setCurrentUUID('')
        //     },
        //     getAbortController: (abortController) => {
        //       // handle abort controller
        //       setController(abortController)
        //     }
        //   }
        // )
      } catch (err) {
        setMessageLoading(false)
        setSendValue('')
        Toast.notify({
          type: 'error',
          message: '网络错误'
        })
        console.error('Fetch error:', err)
      }
    } else {
      try {
        const { payload } = (await dispatch(
          addChatMessages({
            conversationId: currentQuestion!.conversationId,
            menu: 8,
            query: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
            resource: ''
          })
        )) as { payload: AddChatMessagesData }
        if (payload) {
          let { message, files } = payload
          if (files.length > 0) {
            message += '</p><p>'
            message += files.map((file) => (file.type === 'image' ? `![图片](${file.url})` : `[文件](${file.url})`)).join('\n\n')
          }
          // 当前发送完成后 不是第一次发送
          dispatch(toggleFirstSend(false))
          await dispatch(
            updateConversitionDetailList({
              id: 0,
              chatId: currentConversation!.chatId,
              content: message,
              type: 1,
              resource: '',
              score: null,
              createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            })
          )
          setMessageLoading(false)
          // 滚动到底部
          scrollBottom()
          getConversationQuestions()
        } else {
          setMessageLoading(false)
          setSendValue('')
          return Toast.notify({ type: 'error', message: '出错了' })
        }
      } catch (error) {
        setMessageLoading(false)
        setSendValue('')
        Toast.notify({
          type: 'error',
          message: '网络错误'
        })
      }
    }
  }
  // 定义enterMessage函数，接收一个React.KeyboardEvent<HTMLTextAreaElement>类型的参数e
  const enterMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果正在加载页面，则返回
    if (messageLoading) {
      setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
      return Toast.notify({ type: 'info', message: '请等待上条信息响应完成' })
    }
    // 如果按下的是回车键
    e.preventDefault() // 防止回车键默认的提交行为
    // 去除输入框中的回车、换行符和空格
    const trimmedValue = sendValue.replace(/\r/gi, '').replace(/\n/gi, '').trim()
    setSendValue(trimmedValue)
    // 如果输入框为空，则不发送消息
    if (!trimmedValue) {
      // 弹出提示框，提示需要输入内容
      return Toast.notify({ type: 'info', message: '请输入内容' })
    } else {
      // 发送消息
      sendMessage()
      // 清空输入框
      setSendValue('')
    }
  }
  // 当尺寸变化时，滚动到底部
  useUpdateEffect(() => {
    if (currentMessageRef.current) {
      // 滚动到底部
      scrollBox.current!.scrollTo({
        top: scrollBox.current!.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [size?.height]) // 依赖于元素的高度变化

  useEffect(() => {
    // 滚动到底部
    scrollBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoToBottom && conversitionDetailList!?.length > 0])

  const handleScoreClick = (item: MessageInfo, score: 'good' | 'bad') => {
    console.log(item.score, score)
    if (!item.score || (item.score === 'bad' && score === 'good') || (item.score === 'good' && score === 'bad')) {
      dispatch(
        AddScore({
          messageId: item.id,
          score
        })
      )
    } else {
      dispatch(CancelScore(item.id))
    }
  }

  return (
    <div
      className="robot absolute h-[610px] w-[450px] bg-white animate__animated animate__fadeInUp animate__faster"
      style={{
        zIndex: 100,
        right,
        bottom,
        ...style
      }}
    >
      <div className="shrink-0 flex items-center justify-between h-14 px-4 border-b ">
        <div className="flex items-center space-x-2">
          <img alt="logo" className="block w-auto h-6 undefined" src={logo} />
          <div className="text-sm font-bold ">智能客服</div>
        </div>
        <div className="icon-container icon-minus-container cursor-pointer" onClick={onClose}>
          <i className="iconfont icon-jianhao" style={{ fontSize: '20px' }}></i>
        </div>
      </div>
      <div className="robot-container h-[calc(100%_-_56px)]">
        <div className="dialogue-detail" style={style}>
          <div className="session-box" ref={scrollBox}>
            <div className="" ref={innerBox}>
              <div className="item">
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img alt="" src={rebotAvatar} />
                    </div>
                  </div>

                  <div className="chat-bubble answer">
                    <div
                      className="markdown-body"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(
                          '您好，欢迎联系GotoAI, GotoAI为深圳市云展信息技术有限公司旗下AI解决方案产品和服务品牌，国内最早提供专业AI 解决方案的提供商，专注于AI战略咨询,AI解决方案设计,AI大语言模型私有化部署,AI大语言模型训练与微调,AIGC 应用定制开发,AI教育培训,AI 工作坊等AI技术服务领域，核心技术骨干来自Microsoft , AWS, Google全球AI领域顶级厂商的技术咨询和服务团队以及国内最早的AI技术社区的布道者，接下来我将为您提供关于GotoAI公司，团队，AI产品和解决方案技术服务相关的咨询，以及售后服务。'
                        )
                      }}
                    ></div>
                  </div>
                  {/* <ExcelPreview url="https://resource.gotoai.world/upload/2/20240428/e7c975264e6c4bbba770d1d3e82783d3.xlsx" /> */}
                  {/* <WordPreview url="https://resource.gotoai.world/upload/2/20240428/a953c440de8c4670b9068922bda607d0.docx" /> */}
                  {/* <CSVPreview url="https://resource.gotoai.world/upload/2/20240428/309d89d7a3794bea91a104303ff7016b.csv" /> */}
                </div>
              </div>
              {!isNewChat &&
                conversitionDetailList &&
                conversitionDetailList.map((item, index) => {
                  return (
                    <div className="item" key={index}>
                      {item.type === 0 && (
                        <div className="chat chat-end">
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img alt="" src={defaultAvatar} />
                            </div>
                          </div>
                          <Tooltip title={'点击复制到输入框'} placement="bottom">
                            <div className="chat-bubble answer copy_content cursor-pointer" onClick={() => setSendValue(item.content)}>
                              {item.content}
                            </div>
                          </Tooltip>
                        </div>
                      )}
                      {item.type === 1 && (
                        <>
                          <div className="chat chat-start">
                            <div className="chat-image avatar">
                              <div className="w-10 rounded-full">
                                <img alt="" src={rebotAvatar} />
                              </div>
                            </div>

                            <div className="chat-bubble answer">
                              <div
                                className="markdown-body"
                                id={item.UUID}
                                ref={index === conversitionDetailList.length - 1 ? currentMessageRef : null}
                                dangerouslySetInnerHTML={{
                                  __html: renderMarkdown(
                                    item.isLoading
                                      ? '<span class="loading loading-dots loading-xs"></span>'
                                      : item.files && item.files.length > 0
                                      ? item.content + '\n\n' + item.files.map((file) => (file.mimetype?.startsWith('image') ? `![图片](${file.url})` : `[文件](${file.url})`)).join('\n\n')
                                      : item.content.endsWith('```') || item.content.match(/\B```\b[a-zA-Z]+\b(?!\s)/)
                                      ? item.content
                                      : item.content + `${currentUUID === item.UUID ? '<span class="gpt-cursor"/></span>' : ''}`
                                  )
                                }}
                              ></div>
                              <div className="interact">
                                <div className="interact-operate">
                                  <Tooltip title={'收藏'} placement="top">
                                    <i className="shim">
                                      <div className="collect"></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'答的不错'} placement="top">
                                    <i className="shim" onClick={() => handleScoreClick(item, 'good')}>
                                      <div className={`${item.score && item.score === 'good' ? 'thumbs-up-active' : 'thumbs-up'}`}></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'还不够好'} placement="top">
                                    <i className="shim" onClick={() => handleScoreClick(item, 'bad')}>
                                      <div className={`${item.score && item.score === 'bad' ? 'thumbs-down-active' : 'thumbs-down'}`}></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'点击可复制'} placement="top">
                                    <i className="shim">
                                      <div className="copy" onClick={() => handleCopyClick(item.content)}></div>
                                    </i>
                                  </Tooltip>
                                  {/* <Tooltip title={'分享'} placement="top">
      <i className="shim">
        <div className="share"></div>
      </i>
    </Tooltip> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          {index === conversitionDetailList.length - 1 && (
                            <div className="followup-container">
                              <div className={`followup-list ${quesionsLoading ? 'conversation-loading' : ''}`}>
                                {quesions &&
                                  quesions.map((quesion) => {
                                    return (
                                      <div key={quesion} onClick={() => sendBeta(false, { content: quesion } as UserPrompt)} className="followup-item">
                                        {quesion}
                                      </div>
                                    )
                                  })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
            </div>
            <div className="last-div"></div>
          </div>
          <div className="search-box animate__bounceInUp">
            <div className="search-container">
              <div className="search flex">
                <div className="search-input-box">
                  <div className="input-wrap">
                    <div className="input-box-inner flex items-end">
                      <TextArea value={sendValue} onPressEnter={(e) => enterMessage(e)} onChange={(e) => setSendValue(e.target.value)} placeholder={placeholder} autoSize={{ minRows: 1, maxRows: 3 }} />
                      <div className="h-[28px]">
                        <img className={`enter ${!sse && messageLoading ? 'loading loading-spinner loading-xs' : ''}`} onClick={() => sendMessage()} src={sendIcon} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// mapStateToProps 函数：将 state 映射到 props
function mapStateToProps(state: RootState) {
  return state.robotSlice
}

// mapDispatchToProps 函数：将 dispatch 映射到 props
function mapDispatchToProps(dispatch: AppDispatch) {
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedRobot = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Robot)
export default ConnectedRobot
