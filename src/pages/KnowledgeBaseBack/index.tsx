import InitPage from '@/components/InitPage'
import Dialogue, { FileInfo } from '@/components/Dialogue'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { UserPrompt } from '../Talk'
import { getDifyInfo } from '@/utils/storage'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import { Tooltip } from 'antd'
import { menuType, menuWarp } from '@/utils/constants'
import { useLocation } from 'react-router-dom'
import { HistoryList } from '@/store/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getHistoryList, delHistoryItem, getConversitionDetail, startChat, addChatMessages, AddChatMessagesData } from '@/store/action/talkActions'
import { clearConversitionDetailList, clearHistoryList, initState, talkInitialState, toggleFirstSend, toggleIsNewChat, updateConversitionDetailList, updateCurrentId, updateLoading } from '@/store/reducers/talk'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useAsyncEffect, useBoolean, useMount, useUnmount } from 'ahooks'
import Toast, { ToastContext } from '@/components/Toast'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import copy from 'copy-to-clipboard'
import { ShartChatResp } from '@/types/app'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'
import Search from '@/components/Search'
import './index.css'
import '@/components/Dialogue/index.css'
import { sendChatMessage } from '@/api/knowledge'
import { useContext } from 'use-context-selector'
import { IOnFile } from '@/utils/request'
type Props = {} & Partial<talkInitialState>
const KnowledgeBase = ({ isNewChat, historyList, currentConversation, conversitionDetailList, firstSend }: Props) => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const appInfo = getDifyInfo()
  // 记录历史折叠状态
  const [historyCollapsed, { toggle: setHistoryCollapsed }] = useBoolean(false)
  // 创建历史折叠按钮的ref
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  // 记录当前菜单的key
  const currentMenuKey = useRef<menuType>(0)
  // 初始化问题Id
  let currentQuestion = currentConversation
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
  // 获取用户信息
  const user = useAppSelector((state) => state.profileSlice.user)
  // 用于处理流式传输的数据
  const streamingText = useRef('')
  // 初始化文件列表
  const [fileList, setFileList] = useState([] as FileInfo[])
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const { notify } = useContext(ToastContext)
  const scrollBottom = () => {
    // 滚动到底部
    scrollBox.current?.scrollTo({
      top: scrollBox.current!.scrollTop + 100000000000000000,
      behavior: 'smooth'
    })
  }

  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    sendBeta(false, item)
  }
  useMount(() => {
    console.log(getDifyInfo())
  })
  const sendMessage = async () => {
    // 如果消息正在加载中，则直接返回
    if (messageLoading) return Toast.notify({ type: 'info', message: '请等待上条信息响应完成' })
    // 将输入框的内容发送给服务器
    setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
    // 如果输入框为空，则提示用户输入内容
    if (!sendValue && !sendValue.trim()) {
      return Toast.notify({ type: 'info', message: '请输入内容' })
    }
    const data: Record<string, any> = {
      inputs: {},
      query: sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
      conversation_id: isNewChat ? null : currentConversation?.conversationId
    }
    sendChatMessage(
      data,
      {
        getAbortController: (abortController: React.SetStateAction<AbortController | null>) => {
          setAbortController(abortController)
        },
        onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
          console.log(message, isFirstMessage, newConversationId, messageId, taskId)
        },
        async onCompleted(hasError?: boolean) {
          console.log(hasError)
        },
        onFile(file: any) {
          console.log(file)
        },
        onThought(thought: any) {
          console.log(thought)
        },
        onMessageEnd: (messageEnd: any) => {
          console.log(messageEnd)
        },
        onMessageReplace: (messageReplace: any) => {
          console.log(messageReplace)
        },
        onError() {}
      },
      appInfo.appId
    )
    // // 创建一个 Typewriter 实例
    // const typewriter = new Typewriter((str: string) => {
    //   // 将输入的内容添加到流中
    //   streamingText.current += str
    //   console.log('str', str)
    //   console.log('+++', streamingText.current)
    // })
    // // 创建一个 StreamGpt 实例
    // const gpt = new StreamGpt({
    //   // 开始时，将内容添加到流中
    //   async onStart() {
    //     dispatch(toggleIsNewChat(false))
    //     // 将内容发送给服务器
    //     const resp = await dispatch(
    //       addMessages([
    //         {
    //           id: 0,
    //           chatId: questionId,
    //           content: sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
    //           type: 0,
    //           resource: ''
    //         }
    //       ])
    //     )
    //     console.log(resp, '开始，user')
    //     setMessageLoading(true)
    //   },
    //   // 创建时，启动 Typewriter
    //   onCreated() {
    //     typewriter.start()
    //     // 获取历史列表
    //     dispatch(getHistoryList({ menu: currentMenuKey.current, page: 1, pageSize: 10 }))
    //     // 更新当前 ID
    //     dispatch(updateCurrentId(questionId))
    //     console.log('更新当前id', questionId)
    //   },
    //   // 更新时，将内容添加到流中
    //   onPatch(text, reduceText) {
    //     typewriter.add(text)
    //     setRespText(reduceText)
    //   },
    //   // 完成时，将消息加载完成
    //   async onDone(text) {
    //     setMessageLoading(false)
    //     setSendValue('')
    //     typewriter.done()
    //     if (text === 'Failed to fetch' || text === 'Load failed' || text === 'Network Error' || text === '请求超时。') {
    //       return Toast.notify({ type: 'error', message: '网络错误' })
    //     }
    //     if (text === '请求频繁，请稍后再试') return Toast.notify({ type: 'error', message: '请求频繁，请稍后再试' })
    //     streamingText.current = ''
    //     console.log(text, '结束了，AI')

    //     // 将内容发送给服务器
    //     await dispatch(
    //       addMessages([
    //         {
    //           id: 0,
    //           chatId: questionId,
    //           content: text,
    //           type: 1,
    //           resource: ''
    //         }
    //       ])
    //     )
    //     // 滚动到底部
    //     scrollBox.current?.scrollTo({
    //       top: scrollBox.current!.scrollTop + 100000000000000000,
    //       behavior: 'smooth'
    //     })
    //     // scrollBox.current!.scrollTop = innerBox.current!.scrollHeight
    //   }
    // })

    // 开始与 AI 对话
    // if (isNewChat) {
    //   gpt.stream([
    //     {
    //       role: 'system',
    //       content: `language: 中文 description: 你是一位精通市面上所有主流开发语言的软件工程师，致力于帮助用户提高开发效率。
    //   Workflows:理解用户需求，分析用户目前所面临的开发难题。提供针对性的开发建议和解决方案。使用各种编程语言演示示例，以帮助用户掌握高效开发方法。
    //   Skills:精通主流开发语言：如Java、Python、C++、JavaScript等。效率提升技巧：代码模板、工具推荐、最佳实践等。few-shot learning：通过少量示例，引导用户快速掌握技能。Examples:示例1：Java多线程开发 Java // Java线程创建示例Thread thread = new Thread(() -> {// 执行任务}); thread.start();注释：此示例演示了如何使用Java创建一个新线程，以实现多线程开发。示例2：Python列表推导式 Python # Python列表推导式示例 squares = [x * x for x in range(10)]注释：此示例展示了如何使用Python列表推导式快速生成一个数的平方列表。 示例3：C++模板编程 Cpp // C++模板示例 template <typename T> T max(T a, T b) {    return a > b ? a : b; }注释：此示例演示了如何使用C++模板编程实现一个通用的最大值函数。OutputFormat:针对用户需求，提供相应编程语言的示例代码。结合注释，解释示例中的关键点和注意事项。如有必要，提供相关开发工具和资源链接。现在面对的用户是一位追求高效的开发者，请务必根据以上要求进行分析和设计，这对他的工作将非常有帮助。`
    //     },
    //     {
    //       role: 'user',
    //       content: sendValue
    //     }
    //   ])
    // } else {
    //   gpt.stream([
    //     {
    //       role: 'user',
    //       content: sendValue
    //     }
    //   ])
    // }
    // gpt.stream([
    //   {
    //     role: 'user',
    //     content: sendValue
    //   }
    // ])
  }
  // 不使用 stream流 来发消息
  const sendBeta = async (defaultRule?: boolean, prompt?: UserPrompt) => {
    console.log(defaultRule, prompt, 'defaultRule', 'prompt')
    // defaultRule 为 true 代表是从 首页预设角色过来的 只需要 传递prompt提词 不用发送用户消息
    // 如果是新会话，则创建一个新的会话
    if (isNewChat) {
      // 创建一个新的会话
      const { payload } = (await dispatch(
        startChat({
          menu: currentMenuKey.current,
          prompt: '',
          promptId: defaultRule ? prompt!.id : 0
        })
      )) as { payload: ShartChatResp }
      currentQuestion = payload
      console.log('是新会话,创建一个新会话 ID为:', payload)
      console.log(currentQuestion, '更新questionId为新会话id')
      // 获取历史列表
      dispatch(getHistoryList({ menu: currentMenuKey.current, page: 1, pageSize: 10 }))
      // 更新当前 ID
      dispatch(updateCurrentId(currentQuestion as ShartChatResp))
      console.log('更新当前id', currentQuestion)
      dispatch(toggleIsNewChat(false))
    }

    // 将内容发送给服务器
    // 正常对话
    if (!defaultRule) {
      // 预设角色不需要发送消息
      setMessageLoading(true)
      // 更新发送次数
      await dispatch(
        updateConversitionDetailList([
          {
            id: 0,
            chatId: currentConversation!.chatId,
            content: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
            type: 0,
            resource: '',
            createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          }
        ])
      )

      // 滚动到底部
      scrollBottom()
      try {
        const { payload } = (await dispatch(
          addChatMessages({
            conversationId: currentQuestion!.conversationId,
            menu: currentMenuKey.current,
            query: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, '')
          })
        )) as { payload: AddChatMessagesData }
        if (payload) {
          if (isNewChat) {
            // 刷新当前历史记录
            // 获取历史列表
            await dispatch(getHistoryList({ menu: currentMenuKey.current, page: 1, pageSize: 10 }))
          }
          //第一次发送 更新左侧历史title
          if (firstSend) {
            await dispatch(getHistoryList({ menu: currentMenuKey.current, page: 1, pageSize: 10 }))
          }
          // 当前发送完成后 不是第一次发送
          dispatch(toggleFirstSend(false))
          await dispatch(
            updateConversitionDetailList([
              {
                id: 0,
                chatId: currentConversation!.chatId,
                content: payload.message,
                type: 1,
                resource: '',
                createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
              }
            ])
          )
          setMessageLoading(false)
          setSendValue('')
          // 滚动到底部
          scrollBottom()
        } else {
          setMessageLoading(false)
          setSendValue('')
          return Toast.notify({ type: 'error', message: '接口暂未实现继续对话' })
        }
      } catch (error) {
        setMessageLoading(false)
        setSendValue('')
        Toast.notify({
          type: 'error',
          message: '网络错误'
        })
      }
    } else {
      await dispatch(
        updateConversitionDetailList([
          {
            id: 0,
            chatId: currentConversation!.chatId,
            content: prompt!.prologue,
            type: 1,
            resource: '',
            createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          }
        ])
      )
    }
  }
  useEffect(() => {
    // scrollBox.current!.scrollTop = innerBox.current!.scrollHeight
    // 滚动到底部
    scrollBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversitionDetailList!?.length > 0])
  useEffect(() => {
    const pathname = location.pathname
    currentMenuKey.current = menuWarp[pathname] as menuType
  }, [dispatch, location.pathname])
  // 初始化
  useMount(async () => {
    await dispatch(initState())
  })
  // 定义enterMessage函数，接收一个React.KeyboardEvent<HTMLTextAreaElement>类型的参数e
  const enterMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果正在加载页面，则返回
    if (messageLoading) return Toast.notify({ type: 'info', message: '请等待上条信息响应完成' })
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
  // 复制事件
  const handleCopyClick = async (text: string) => {
    if (copy(text)) {
      Toast.notify({ type: 'success', message: '复制成功' })
    } else {
      Toast.notify({ type: 'error', message: '复制失败' })
    }
  }
  // 定义markdown解析
  const md: MarkdownIt = new MarkdownIt({
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
  })
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const langClass = token.info ? `language-${token.info}` : ''
    const lines = token.content.split('\n').slice(0, -1)
    const lineNumbers = lines.map((line, i) => `<span>${i + 1}</span>`).join('\n')
    console.log(token.info, 'token.info')

    const content = hljs.highlight(token.content, { language: token.info || 'md', ignoreIllegals: true }).value
    // 为每个代码块创建一个唯一的ID
    const uniqueId = `copy-button-${Date.now()}-${Math.random()}`
    // 创建一个复制按钮 在makedown 渲染完成之后在插入
    setTimeout(() => {
      const copybutton = document.getElementById(uniqueId)
      if (copybutton) {
        copybutton.addEventListener('click', () => handleCopyClick(token.content))
      }
    })
    return `
    <div class="${langClass}">
      <div class="top"> <div class="language">${token.info}</div><div class="copy-button" id="${uniqueId}">复制</div></div>
      <pre class="hljs"><code><span class="line-numbers-rows">${lineNumbers}</span>${content}</code></pre>
    </div>
    `
    // return `<div></div>`
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

  // 切换历史折叠状态
  const toggleHistory = (flag: Boolean) => {
    if (flag) {
      historyDivRef.current.style.display = 'none'
    } else {
      historyDivRef.current.style.display = ''
    }
    setHistoryCollapsed()
  }
  // 创建新的会话
  const createNewConversation = () => {
    if (isNewChat) {
      return Toast.notify({
        type: 'info',
        message: '已经是最新对话'
      })
    }
    // 置空
    dispatch(
      updateCurrentId({
        chatId: 0,
        conversationId: ''
      })
    )
    // 清空历史记录
    dispatch(clearConversitionDetailList())
    dispatch(toggleIsNewChat(true))
    dispatch(toggleFirstSend(true))
  }

  // 删除历史记录某条
  const delHistory = async (e: React.MouseEvent<HTMLElement, MouseEvent>, id: number) => {
    e.stopPropagation()
    if (!id) return
    // loading
    dispatch(updateLoading(true))
    // 删除历史记录
    const isdelete = await dispatch(delHistoryItem(id))
    if (!isdelete) return dispatch(updateLoading(false))
    dispatch(toggleIsNewChat(true))
    // 删除成功
    Toast.notify({ type: 'success', message: '删除成功' })
    // 加载第一页
    await loadMore(1)
    // 关闭loading
    dispatch(updateLoading(false))
    dispatch(clearConversitionDetailList())
  }
  // 获取
  const getConversationList = async (item: HistoryList) => {
    // 如果当前id 等于传过来的id 直接return
    if (currentConversation!.chatId === item.id) return
    dispatch(toggleIsNewChat!(false))
    // 切换当前会话id
    dispatch(
      updateCurrentId({
        conversationId: item.conversationid,
        chatId: item.id
      })
    )
    // loading
    dispatch(updateLoading(true))
    // 清空之前的会话详情
    dispatch(clearConversitionDetailList())
    // 获取会话详情
    await dispatch(getConversitionDetail(item.id))
    // 关闭 loading
    dispatch(updateLoading(false))
  }
  useEffect(() => {
    const pathname = location.pathname
    currentMenuKey.current = menuWarp[pathname] as menuType
  }, [dispatch, location.pathname])

  const loadMore = (page?: number) => {
    if (!historyList) return
    dispatch(
      getHistoryList({
        menu: currentMenuKey.current,
        page: page ? page : historyList.pageIndex + 1,
        pageSize: parseInt(window.innerHeight / 80 + '') + 1
      })
    )
  }
  // 页面初始化加载第一页
  useMount(() => {
    loadMore(1)
  })
  // 页面卸载 清空
  useUnmount(() => {
    dispatch(initState())
  })
  return (
    <div className="knowledge_base">
      <div className={`history`} ref={historyDivRef}>
        <div className="histroy-header">
          <div className="left-header-block-up">
            <p className="text font-semibold">历史记录</p>
            <div className="fold">
              <Tooltip className="cursor-pointer" placement="right" title={'收起历史记录'}>
                <i className="iconfont icon-zhedie" onClick={() => toggleHistory(true)}></i>
              </Tooltip>
            </div>
          </div>
          <div className="new-session-button-wrap" onClick={() => createNewConversation()}>
            <div className="new-session-button">
              <span>{<img src={newSessionIcon} alt="" />} 新建对话</span>
            </div>
          </div>
        </div>
        <div className="history-list animate__animated animate__fadeInUp animate__faster" id="scrollableDiv">
          {historyList?.empty && (
            <div className=" w-full h-full flex justify-center" style={{ alignItems: 'center' }}>
              <span className="loading loading-dots loading-lg"></span>
            </div>
          )}
          {historyList && historyList.rows.length > 0 && (
            <InfiniteScroll
              dataLength={historyList.recordCount}
              next={loadMore}
              hasMore={historyList.pageCount >= historyList.pageIndex}
              loader={
                <div className="flex justify-center mt-3" style={{ alignItems: 'center' }}>
                  <span className="loading loading-dots loading-lg"></span>
                </div>
              }
              key={Date.now()}
              scrollableTarget="scrollableDiv"
              endMessage={<p className=" flex justify-center items-center pl-3 pr-3 pt-3 pb-3 text-gray-500">没有更多了</p>}
              style={{ scrollbarWidth: 'none' }}
            >
              {historyList.rows.map((item, index) => {
                return (
                  <div onClick={() => getConversationList(item)} className={`history-item ${currentConversation?.chatId === item.id ? 'active' : ''}`} key={index}>
                    <div className="title text-ellipsis overflow-hidden" title={item.title}>
                      {item.title}
                    </div>
                    <div className="time">
                      <span>{item.createTime.replace('T', '  ')}</span> <i style={{ display: 'none' }} className="iconfont icon-shanchu" onClick={(e) => delHistory(e, item.id)}></i>
                    </div>
                  </div>
                )
              })}
            </InfiniteScroll>
          )}
        </div>
      </div>
      {historyCollapsed && (
        <div className="expand-bar">
          <Tooltip placement="right" title={'新建对话'}>
            <div className="add-session-icon" onClick={() => createNewConversation()}></div>
          </Tooltip>

          <Tooltip placement="right" title={'展开历史记录'}>
            <div className="expand-icon" onClick={() => toggleHistory(false)}></div>
          </Tooltip>
        </div>
      )}

      <div className="knowledge-container">
        <div className="knowledge-box">
          {isNewChat && <InitPage onPromptClick={onPrompt} />}
          <div className="dialogue-detail">
            <div className="session-box" ref={scrollBox}>
              <div className="" ref={innerBox}>
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
                            <Tooltip title={'点击复制到输入框'} placement="bottom">
                              <div className="chat-bubble answer copy_content cursor-pointer" onClick={() => setSendValue(item.content)}>
                                {item.content}
                              </div>
                            </Tooltip>
                          </div>
                        )}
                        {item.type === 1 && (
                          <div className="chat chat-start">
                            <div className="chat-image avatar">
                              <div className="w-10 rounded-full">
                                <img alt="Tailwind CSS chat bubble component" src={rebotAvatar} />
                              </div>
                            </div>

                            <div className="chat-bubble answer">
                              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: md.render(item.content) }}></div>
                              <div className="interact">
                                <div className="interact-operate">
                                  <Tooltip title={'收藏'} placement="top">
                                    <i className="shim">
                                      <div className="collect"></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'答的不错'} placement="top">
                                    <i className="shim">
                                      <div className="thumbs-up"></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'还不够好'} placement="top">
                                    <i className="shim">
                                      <div className="thumbs-down"></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'点击可复制'} placement="top">
                                    <i className="shim">
                                      <div className="copy" onClick={() => handleCopyClick(item.content)}></div>
                                    </i>
                                  </Tooltip>
                                  <Tooltip title={'分享'} placement="top">
                                    <i className="shim">
                                      <div className="share"></div>
                                    </i>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
              {/* <div className="last-div"></div> */}
            </div>
            <Search fileList={fileList} setFileList={setFileList} sendMessage={sendMessage} sendValue={sendValue} setSendValue={setSendValue} uploadHandle={uploadHandle} enterMessage={enterMessage} messageLoading={messageLoading} uploadRef={uploadRef} />
          </div>
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
