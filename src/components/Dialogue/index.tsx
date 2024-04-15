import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import Search from '../Search'
import './index.css'
import Toast from '../Toast'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { initState, talkInitialState, toggleFirstSend, toggleIsNewChat, updateConversitionDetailList, updateCurrentId } from '@/store/reducers/talk'
import { addChatMessages, AddChatMessagesData, getHistoryList, startChat } from '@/store/action/talkActions'
import dayjs from 'dayjs'
import { useLocation } from 'react-router-dom'
import { Typewriter } from '@/utils/format'
import { StreamGpt } from '@/api/openai'
import { menuType, menuWarp } from '@/utils/constants'
import { Tooltip } from 'antd'
import copy from 'copy-to-clipboard'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'
import { MessageInfo } from '@/store/types'
import { UserPrompt } from '@/pages/Talk'
import { useMount } from 'ahooks'
import { ShartChatResp } from '@/types/app'
import { imgLazyload } from '@mdit/plugin-img-lazyload'
// 定义一个文件信息的类型
export type FileInfo = {
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
type ChatError = {
  message: string
  type: string
  code: string
  param: string | null
}
// 接受一个conversitionDetailList 返回一个 gpt对话格式的历史记录列表 生成历史记录列表
export const generateHistoryList = (conversationDetailList: MessageInfo[]) => {
  if (!conversationDetailList) return []
  return conversationDetailList.map(({ type, content }) => ({
    role: type === 0 ? 'user' : type === 1 ? 'assistant' : 'system',
    content
  })) as unknown as {
    role: 'user' | 'assistant'
    content: string
  }[]
}
type Props = {
  onSendMessage?: (prompt: string, message: string) => void
  style?: React.CSSProperties
} & Partial<talkInitialState>

const Dialogue = forwardRef(({ isNewChat, conversitionDetailList, currentConversation, style, firstSend }: Props, ref) => {
  // 初始化问题Id
  let currentQuestion = currentConversation
  const location = useLocation()
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
  // 获取用户信息
  const user = useAppSelector((state) => state.profileSlice.user)
  // 用于处理流式传输的数据
  const streamingText = useRef('')
  // 初始化文件列表
  const [fileList, setFileList] = useState([] as FileInfo[])
  // 记录当前菜单的key
  const currentMenuKey = useRef<menuType>(0)
  const scrollBottom = () => {
    // 滚动到底部
    scrollBox.current?.scrollTo({
      top: scrollBox.current!.scrollTop + 100000000000000000,
      behavior: 'smooth'
    })
  }
  const onDownload = (src: string) => {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url
        link.download = 'image.png'
        document.body.appendChild(link)
        link.click()
        URL.revokeObjectURL(url)
        link.remove()
      })
  }
  const sendMessage = async () => {
    // 如果消息正在加载中，则直接返回
    if (messageLoading) return Toast.notify({ type: 'info', message: '请等待上条信息响应完成' })
    // 将输入框的内容发送给服务器
    setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
    // 如果输入框为空，则提示用户输入内容
    if (!sendValue && !sendValue.trim()) {
      return Toast.notify({ type: 'info', message: '请输入内容' })
    }

    sendBeta()
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
          let { message, files } = payload
          if (files.length > 0) {
            message += files.map((file) => (file.type === 'image' ? `![图片](${file.url})` : `[文件](${file.url})`)).join('\n')
          }
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
                content: message,
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
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
  }).use(imgLazyload)

  // 保存原始的链接渲染函数
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
  // 自定义链接渲染函数
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // 添加 target 和 rel 属性
    tokens[idx].attrPush(['target', '_blank'])
    tokens[idx].attrPush(['rel', 'noopener noreferrer'])

    // 调用原始的链接渲染函数
    return defaultRender(tokens, idx, options, env, self)
  }
  // 自定义图片渲染
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx]
    const src = token.attrGet('src')
    const alt = token.attrGet('alt')
    const title = token.attrGet('title')
    return `<a href="${src}" target="_blank" class="img-preview"><img src="${src}" alt="${alt}" title="${title}" style="width: 300px; height: 300px;"/></a>`
  }
  md.renderer.rules.fence = (tokens, idx) => {
    // 匹配 a标签  给a标签加上  target="_blank" rel="noopener noreferrer"属性
    const token = tokens[idx]
    const langClass = token.info ? `language-${token.info}` : ''
    const lines = token.content.split('\n').slice(0, -1)
    const lineNumbers = lines.map((line, i) => `<span>${i + 1}</span>`).join('\n')
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

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    sendBeta
  }))

  // useEffect(() => {
  //   ipInCN()
  // }, [])
  return (
    <div className="dialogue-detail" style={style}>
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
                        <div
                          className="markdown-body"
                          dangerouslySetInnerHTML={{
                            __html: md.render(`${item.files && item.files!.length > 0 ? item.content + '\n\n' + item.files!.map((file) => (file.type === 'image' ? `![图片](${file.url})` : `[文件](${file.url})`)).join('\n\n') : item.content}`)
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
  )
})
// mapStateToProps 函数：将 state 映射到 props
function mapStateToProps(state: RootState) {
  return state.talkSlice
}

// mapDispatchToProps 函数：将 dispatch 映射到 props
function mapDispatchToProps(dispatch: AppDispatch) {
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedDialogue = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Dialogue)
export default ConnectedDialogue
