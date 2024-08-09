import SplitPane, { Pane } from 'split-pane-react'
import './index.css'
import 'split-pane-react/esm/themes/default.css'
import TinyMCEEditor from '@/components/TinymceEditor'
import { handleCopyClick } from '@/components/Dialogue_doc'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import Search, { getIconUrlByFileType } from '@/components/Search'
import '@/components/MdRender/md.css'
import Toast from '@/components/Toast'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { initState, talkInitialState, toggleFirstSend, toggleIsNewChat, updateConversitionDetail, updateConversitionDetailList, updateCurrentId } from '@/store/reducers/talk'
import { addChatMessages, AddChatMessagesData, AddScore, CancelScore, getHistoryList, getQuesions, startChat } from '@/store/action/talkActions'
import dayjs from 'dayjs'
import { useLocation } from 'react-router-dom'
import { menuType, menuWarp } from '@/utils/constants'
import { Button, ConfigProvider, FloatButton, Input, Modal, Popover, Radio, RadioChangeEvent, Tabs, Tooltip } from 'antd'
import 'highlight.js/styles/atom-one-dark.css'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'
import stopIcon from '@/assets/images/session_stop_icon2.svg'
import refreshIcon from '@/assets/images/refresh.png'
import { UserPrompt } from '@/pages/Talk'
import { useMount, useSize, useUnmount, useUpdateEffect } from 'ahooks'
import { ShartChatResp } from '@/types/app'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getTokenInfo } from '@/utils/storage'
import { UUID } from '@/utils/libs'
import { isCsvFile, isExcelFile, isPdfFile, isWordFile } from '@/utils/is'
import ExcelPreview from '@/components/Excel'
import { uploadFile } from '@/api/upload'
import WordPreview from '@/components/Docx'
import PDFViewer from '@/components/PDFViewer'
import CSVPreview from '@/components/Csv'
import { formatFileSize, formatFileType } from '@/utils/format'
import { renderMarkdown } from '@/components/MdRender/markdownRenderer'
import { MessageInfo } from '@/store/types'
import { REACT_APP_BASE_URL_CONFIG } from '@/config'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { renderIcon } from '../Knowledge'
// 定义一个文件信息的类型
export type FileInfo = {
  // 文件的 id
  id: string
  // 文件的名称
  name: string
  // 文件的大小
  size: number
  // 文件的 url
  url: string
  // 文件的头缀
  type: string
  loading?: boolean
  error?: boolean
  uuid?: string
}
type Props = {
  onSendMessage?: (prompt: string, message: string) => void
  placeholder?: string
  hasUploadBtn?: boolean
  initChildren?: React.ReactNode
  // lastChildFullHeight?: boolean
  autoToBottom?: boolean
  fileId?: string
  sse?: boolean
  hasFooter?: boolean
  multiple?: boolean
  style?: React.CSSProperties
  fileIds?: string[]
} & Partial<talkInitialState>
const styles = [
  { label: '常规风格', value: '请以常规风格生成全文，保持语言通顺、条理清晰，使文章易于理解和接受。' },
  { label: '华丽风格', value: '请以华丽风格生成全文，运用丰富的修辞手法和高级词汇，增加文章的艺术性和表现力。' },
  { label: '技术科技范式', value: '请以技术科技范式生成全文，使用专业术语和精准的数据，突出文章在科技领域的专业性和权威性。' },
  { label: '严肃风格', value: '请以严肃风格生成全文，采用正式的语言和严谨的态度，使文章显得庄重和权威。' },
  { label: '学术风格', value: '请以学术风格生成全文，注重理论的阐述和逻辑的严密，引用相关研究和文献，提高文章的学术价值。' },
  { label: '互联网风格', value: '请以互联网风格生成全文，运用网络流行语、轻松幽默的表达方式，使文章更加接地气，贴近大众阅读习惯。' }
]
export default function DocDetail() {
  const [sizes, setSizes] = useState([50, 50])
  const editorRef = useRef<{ setContent: (content: string) => {}; getContent: () => string; getFormatContent: () => string }>(null)
  const insertHandle = (key: string, content: string) => {
    // 0 内容回答 1 生成大纲
    console.log(key, content)
    if (key === '1') {
      editorRef.current?.setContent(content)
    } else if (key === '0') {
      const currentContent = editorRef.current?.getContent() || ''
      editorRef.current?.setContent(currentContent + content)
    }
  }
  const [value, setValue] = useState()

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value)
  }
  // 个人知识库显示隐藏
  const [myKnowledgeVisible, setMyKnowledgeVisible] = useState(false)
  // 企业知识库显示隐藏
  const [enterpriseKnowledgeVisible, setEnterpriseKnowledgeVisible] = useState(false)
  // 选中的个人知识库
  const [selectedMyKnowledge, setSelectedMyKnowledge] = useState<DataType[]>([])
  // 选中的企业知识库
  const [selectedEnterpriseKnowledge, setSelectedEnterpriseKnowledge] = useState<DataType[]>([])

  const Dialogue = forwardRef(({ isNewChat, conversitionDetailList, currentConversation, style, firstSend, placeholder = '输入你的问题或需求', hasUploadBtn = false, initChildren, autoToBottom = true, fileId, sse = false, hasFooter = true, multiple, fileIds }: Props, ref) => {
    // 初始化问题Id
    let currentQuestion = currentConversation
    const location = useLocation()
    // 获取 dispatch 对象，用于触发 actions
    const dispatch = useAppDispatch()
    // 初始化输入框的值
    const [sendValue, setSendValue] = useState('')
    // 判断是否在加载消息
    const [messageLoading, setMessageLoading] = useState(false)
    // 联想词loading
    const [quesionsLoading, setQuesionsLoading] = useState(false)
    // 联想词内容
    const [quesions, setQuesions] = useState<string[]>([])
    // initQuesions
    const [initQuesions, setInitQuesions] = useState(true)
    // 创建一个滚动框
    const scrollBox = useRef<HTMLDivElement>(null)
    // 创建一个内框
    const innerBox = useRef<HTMLDivElement>(null)
    // 创建一个上传组件
    const uploadRef = useRef<HTMLInputElement>(null)
    // 初始化文件列表
    const [fileList, setFileList] = useState<FileInfo[]>([])
    // 记录当前菜单的key
    const currentMenuKey = useRef<menuType>(0)
    const [currentUUID, setCurrentUUID] = useState('')
    const [controller, setController] = useState<AbortController>()
    const currentMessageRef = useRef<HTMLDivElement>(null)
    // 使用 useSize 监听 scrollBoxRef 元素的尺寸变化
    const size = useSize(currentMessageRef)
    const [showRefresh, setShowRefresh] = useState(false)
    // tabs
    const [activeKey, setActiveKey] = useState('0') // 当前激活的 tab '0' 内容回答 ‘1’ 生成大纲
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
        setQuesionsLoading(false)
        setTimeout(() => {
          scrollBottom()
        }, 0)
        setInitQuesions(false)
      } catch (error) {
        setQuesionsLoading(false)
        setInitQuesions(false)
      }
    }
    // 刷新当前历史记录
    const refreshHistoryList = () => {
      dispatch(getHistoryList({ menu: currentMenuKey.current, page: 1, pageSize: parseInt(window.innerHeight / 80 + '') + 1 }))
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
    }
    // 不使用 stream流 来发消息
    const sendBeta = async (defaultRule?: boolean, prompt?: UserPrompt) => {
      setQuesions([])
      setShowRefresh(false)
      console.log(defaultRule, prompt, 'defaultRule', 'prompt')
      // defaultRule 为 true 代表是从 首页预设角色过来的 只需要 传递prompt提词 不用发送用户消息
      // 如果是新会话，则创建一个新的会话
      if (isNewChat && currentMenuKey.current !== 1) {
        // 创建一个新的会话
        const { payload } = (await dispatch(
          startChat({
            menu: currentMenuKey.current,
            prompt: '',
            promptId: defaultRule ? prompt!.id : 0,
            fileId: fileId
          })
        )) as { payload: ShartChatResp }
        currentQuestion = payload
        console.log('是新会话,创建一个新会话 ID为:', payload)
        console.log(currentQuestion, '更新questionId为新会话id')
        // 获取历史列表
        refreshHistoryList()
        // 更新当前 ID
        dispatch(updateCurrentId(currentQuestion as ShartChatResp))
        console.log('更新当前id', currentQuestion)
        dispatch(toggleIsNewChat(false))
      }
      setFileList([])
      // 将内容发送给服务器
      // 正常对话
      if (!defaultRule) {
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
                    id: 0,
                    chatId: currentConversation!.chatId,
                    content: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
                    type: 0,
                    resource: fileList.map((file) => file.id).join(',') || '',
                    createtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    files: fileList.map((file) => ({
                      id: file.id,
                      name: file.name,
                      url: file.url,
                      type: file.type,
                      mimetype: file.type,
                      size: file.size
                    }))
                  },
                  {
                    id: 0,
                    UUID: uuid,
                    chatId: currentConversation!.chatId,
                    content: '',
                    isLoading: true,
                    type: 1,
                    resource: '',
                    createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                  }
                ]
              : {
                  id: 0,
                  chatId: currentConversation!.chatId,
                  content: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
                  type: 0,
                  resource: fileList.map((file) => file.id).join(',') || '',
                  createtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  files: fileList.map((file) => ({
                    id: file.id,
                    name: file.name,
                    url: file.url,
                    type: file.type,
                    mimetype: file.type,
                    size: file.size
                  }))
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
                menu: currentMenuKey.current,
                query: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
                files: fileIds
              }),
              onopen(response) {
                // 建立连接的回调
                if (isNewChat || firstSend) {
                  // 刷新当前历史记录
                  // 获取历史列表
                  refreshHistoryList()
                }
                // 当前发送完成后 不是第一次发送
                dispatch(toggleFirstSend(false))
                // 当前发送完成后 不是第一次发送
                dispatch(toggleFirstSend(false))
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
                  // 更新左侧历史title
                  refreshHistoryList()
                  dispatch(updateConversitionDetail({ UUID: uuid, content: '' }))
                  getConversationQuestions()
                }
              },
              onclose() {
                // 正常结束的回调
                newController.abort() // 关闭连接
              },
              onerror(err) {
                console.log(err, 'err')
                // 连接出现异常回调
                // 必须抛出错误才会停止
                setMessageLoading(false)
                setSendValue('')
                throw err
              }
            })
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
                menu: currentMenuKey.current,
                query: prompt?.content || sendValue.replace(/\r/gi, '').replace(/\n/gi, ''),
                files: fileList.map((file) => file.id)
              })
            )) as { payload: AddChatMessagesData }
            if (payload) {
              let { message, files } = payload
              if (files.length > 0) {
                message += '</p><p>'
                message += files
                  .map((file) => {
                    const isImage = file.type ? /(image|jpeg|jpg|gif|png)$/.test(file.type) : file.url.endsWith('.gif') || file.url.endsWith('.png') || file.url.endsWith('.jpg') || file.url.endsWith('.jpeg')
                    return isImage ? `![图片](${file.url})` : `[文件](${file.url})`
                  })
                  .join('\n\n')
              }
              if (isNewChat) {
                // 刷新当前历史记录
                // 获取历史列表
                await refreshHistoryList()
              }
              //第一次发送 更新左侧历史title
              if (firstSend) {
                await refreshHistoryList()
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
                  createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                })
              )
              setMessageLoading(false)
              // 滚动到底部
              scrollBottom()
              await getConversationQuestions()
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
      } else {
        await dispatch(
          updateConversitionDetailList({
            id: 0,
            chatId: currentConversation!.chatId,
            content: prompt!.prologue,
            type: 1,
            resource: '',
            createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          })
        )
      }
    }
    const stopMessage = async () => {
      if (messageLoading) {
        controller?.abort()
        setMessageLoading(false)
        await dispatch(updateConversitionDetail({ UUID: currentUUID, content: '\n\n本次回答已被终止' }))
        setCurrentUUID('')
        setShowRefresh(true)
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

    const uploadHandle = async (e: React.ChangeEvent<HTMLInputElement> | undefined) => {
      if (fileList.length > 9) return Toast.notify({ type: 'info', message: '最多上传十个文件' })
      if (!e!.target.files) return
      const files = e!.target.files
      const supportedFormats = ['excel', 'pdf', 'csv'] // 使用格式名称

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 创建一个AbortController，以便于后续可能需要取消上传
        const controller = new AbortController()
        const signal = controller.signal
        let uuid = UUID()
        // 将文件添加到fileList中

        setFileList(
          (prev) =>
            [
              ...prev,
              {
                uuid, // 将UUID添加到文件对象中
                id: '',
                name: file.name,
                size: 0,
                url: '',
                type: file.type,
                loading: true
              }
            ] as FileInfo[]
        )
        // 调用uploadFile方法上传每个文件
        uploadFile(
          currentMenuKey.current, // 假设这是你的menu参数
          file,
          signal,
          (percentage) => {
            console.log(`上传进度: ${percentage}%`, uuid) // 进度回调
          },
          (data) => {
            // 成功回调
            console.log('上传成功', data)
            Toast.notify({ type: 'success', message: file.name + '上传成功' })
            // 更新fileList或其他状态
            setFileList((prev) =>
              prev.map((item) =>
                item.uuid === uuid // 使用UUID来匹配文件
                  ? {
                      ...item,
                      id: data.fileId,
                      size: file.size,
                      url: data.url,
                      loading: false
                    }
                  : item
              )
            )
          },
          (error) => {
            setFileList((prev) =>
              prev.map((item) =>
                item.uuid === uuid // 使用UUID来匹配文件
                  ? {
                      ...item,
                      loading: false,
                      error: true
                    }
                  : item
              )
            )
            // 失败回调
            console.error('上传失败', error)
            Toast.notify({ type: 'error', message: `${file.name}上传失败: ${error}` })
          },
          supportedFormats,
          20 * 1024 * 1024
        )
      }
    }

    useImperativeHandle(ref, () => ({
      // 暴露给父组件的方法
      sendBeta,
      setSendValue
    }))

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

    useEffect(() => {
      const pathname = location.pathname
      currentMenuKey.current = menuWarp[pathname] as menuType
    }, [dispatch, location.pathname])

    useEffect(() => {
      if (conversitionDetailList!.length > 0 && !firstSend && initQuesions) {
        getConversationQuestions()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversitionDetailList?.length])

    useUpdateEffect(() => {
      setInitQuesions(true)
      setQuesions([])
      setShowRefresh(false)
      setMessageLoading(false)
    }, [currentConversation])

    useMount(() => {
      setInitQuesions(true)
    })
    // 初始化
    useUnmount(() => {
      currentMenuKey.current !== 11 && dispatch(initState())
      setShowRefresh(false)
    })

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
      <div className="dialogue-detail" style={style}>
        <div className="session-box" ref={scrollBox}>
          <div className="" ref={innerBox}>
            {initChildren && initChildren}
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
                          <div className="chat-bubble answer copy_content cursor-pointer " onClick={() => setSendValue(item.content)}>
                            {item.files && item.files.length > 0 && (
                              <div className="question-file mb-3">
                                {item.files.length > 0 &&
                                  item.files.map((file) => {
                                    return (
                                      <div className="file-box" key={file.id}>
                                        <div className="file">
                                          <div className="icon" style={{ backgroundImage: `url(${getIconUrlByFileType(file.mimetype!)})` }} />
                                          <div className="file-info">
                                            <p className="name dot text-ellipsis" title={file.name}>
                                              {file.name}
                                            </p>
                                            <div className="status">
                                              <div className="success">
                                                <p className="type">{formatFileType(file.mimetype!)}</p>
                                                <p className="size">{formatFileSize(file.size)}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </div>
                            )}
                            {item.content}
                          </div>
                        </Tooltip>
                        {/* {item.files.length > 0 &&
                              item.files.map((file) => {
                                if (isExcelFile(file.name)) {
                                  return <ExcelPreview key={file.url} url={file.url} />
                                } else if (isWordFile(file.name)) {
                                  return <WordPreview key={file.url} url={file.url} />
                                } else if (isPdfFile(file.name)) {
                                  return <PDFViewer key={file.url} url={file.url} hasTools={false} handleMouseUp={() => {}} />
                                } else if (isCsvFile(file.name)) {
                                  return <CSVPreview key={file.url} url={file.url} />
                                } else {
                                  // 对于不支持的文件类型，可以选择不渲染或渲染一个默认组件
                                  return null
                                }
                              })} */}
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
                                    : item.content + `${currentUUID === item.UUID ? '<span class="gpt-cursor"></span>' : ''}`
                                )
                              }}
                            ></div>
                            {!currentUUID && !item.isLoading && (
                              <div className="flex justify-between text-[14px] mt-3">
                                <div className="text-[#ccc]">以上内容为AI生成，不代表开发者立场</div>
                                <div
                                  className="text-[#1677ff] cursor-pointer"
                                  onClick={() => {
                                    insertHandle(activeKey, item.content)
                                  }}
                                >
                                  插入
                                </div>
                              </div>
                            )}
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

                            {item.files &&
                              item.files.length > 0 &&
                              item.files.map((file) => {
                                if (isExcelFile(file.name)) {
                                  return <ExcelPreview key={file.url} url={file.url} />
                                } else if (isWordFile(file.name)) {
                                  return <WordPreview key={file.url} url={file.url} />
                                } else if (isPdfFile(file.name)) {
                                  return <PDFViewer key={file.url} url={file.url} hasTools={false} handleMouseUp={() => {}} />
                                } else if (isCsvFile(file.name)) {
                                  return <CSVPreview key={file.url} url={file.url} />
                                } else {
                                  // 对于不支持的文件类型，可以选择不渲染或渲染一个默认组件
                                  return null
                                }
                              })}
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
          <div className="last-div">
            {showRefresh && (
              <div
                className="input-msg flex"
                onClick={() => {
                  sendBeta(false, {
                    content: conversitionDetailList![conversitionDetailList!.length - 2].content
                  } as UserPrompt)
                  setShowRefresh(false)
                }}
              >
                <div>
                  <img src={refreshIcon} alt="" />
                  <span>重新生成</span>
                </div>
              </div>
            )}
            <div className="input-msg flex" style={{ display: sse && messageLoading ? '' : 'none' }}>
              <div onClick={stopMessage}>
                <img src={stopIcon} alt="" />
                <span>停止生成</span>
              </div>
            </div>
          </div>
        </div>
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                horizontalMargin: '0px'
              }
            }
          }}
        >
          <Tabs
            onChange={setActiveKey}
            type="card"
            tabBarExtraContent={
              <div className="pr-2 flex items-center">
                <Tooltip title="在生成全文时，将参考您选择的素材。大纲、概述的生成不参考哦！" placement="left">
                  <QuestionCircleOutlined /> <span className="mr-2">参考素材:</span>
                </Tooltip>
                <Radio.Group onChange={onChange} value={value}>
                  <Radio value={1}>我的知识 {value === 1 ? <i className="iconfont icon-xia cursor-pointer hover:text-[#1890ff]" onClick={() => setMyKnowledgeVisible(true)}></i> : ''}</Radio>
                  <Radio value={2}>企业知识 {value === 2 ? <i className="iconfont icon-xia cursor-pointer hover:text-[#1890ff]" onClick={() => setEnterpriseKnowledgeVisible(true)}></i> : ''}</Radio>
                  <Radio value={3}>知网文献 {value === 3 ? <i className="iconfont icon-xia cursor-pointer hover:text-[#1890ff]"></i> : ''}</Radio>
                </Radio.Group>
                <div className="ml-1 cursor-pointer text-[14px] text-[#1890ff]" onClick={() => setValue(undefined)}>
                  清除
                </div>
              </div>
            }
            items={[
              {
                key: '0',
                label: '内容回答',
                children: (
                  <Search
                    fileList={fileList}
                    setFileList={setFileList}
                    sendMessage={sendMessage}
                    sendValue={sendValue}
                    setSendValue={setSendValue}
                    uploadHandle={uploadHandle}
                    enterMessage={enterMessage}
                    messageLoading={messageLoading}
                    uploadRef={uploadRef}
                    placeholder={'我要提问'}
                    hasUploadBtn={hasUploadBtn}
                    sse={sse}
                    hasFooter={hasFooter}
                    multiple={multiple}
                    // scrollToBottom={scrollBottom}
                  />
                )
              },
              {
                key: '1',
                label: '生成大纲',
                children: (
                  <Search
                    fileList={fileList}
                    setFileList={setFileList}
                    sendMessage={sendMessage}
                    sendValue={sendValue}
                    setSendValue={setSendValue}
                    uploadHandle={uploadHandle}
                    enterMessage={enterMessage}
                    messageLoading={messageLoading}
                    uploadRef={uploadRef}
                    placeholder={'请直接点击按钮生成,如有其他文档主题可在此输入'}
                    hasUploadBtn={hasUploadBtn}
                    sse={sse}
                    hasFooter={hasFooter}
                    multiple={multiple}
                    // scrollToBottom={scrollBottom}
                  />
                )
              }
            ]}
          />
        </ConfigProvider>
      </div>
    )
  })
  function mapStateToProps(state: RootState) {
    return state.talkSlice
  }

  // mapDispatchToProps 函数：将 dispatch 映射到 props
  function mapDispatchToProps(dispatch: AppDispatch) {
    return {}
  }
  // 使用 connect 连接组件和 Redux store
  const ConnectedDialogue = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Dialogue)
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void>; setSendValue: (value: string) => void }>()

  type Ttype = 'txt' | 'docx' | 'pdf' | 'folder'
  interface DataType {
    key: React.Key
    name: string
    owner: string
    numberOfNotes: string
    source: string
    uploadTime: string
    type: Ttype
  }
  const dataSource: DataType[] = [
    // {
    //   key: '0',
    //   name: '1',
    //   owner: 'John',
    //   numberOfNotes: '-',
    //   source: '-',
    //   uploadTime: '2024-01-01',
    //   type: 'folder'
    // },
    {
      key: '1',
      name: '未命名.txt',
      owner: 'John',
      numberOfNotes: '10',
      source: 'Local',
      uploadTime: '2024-01-01 12:34',
      type: 'txt'
    },
    {
      key: '2',
      name: '国际贸易.docx',
      owner: 'Jane',
      numberOfNotes: '5',
      source: 'Remote',
      uploadTime: '2024-02-01 23:45',
      type: 'docx'
    },
    {
      key: '3',
      name: '生态环保.pdf',
      owner: 'Jim',
      numberOfNotes: '8',
      source: 'Local',
      uploadTime: '2024-03-01 09:12',
      type: 'pdf'
    }

    // 添加更多数据项...
  ]
  return (
    <div className="doc-detail w-full h-full relative split-pane">
      <Modal title="选择我的知识" open={myKnowledgeVisible} onOk={() => setMyKnowledgeVisible(false)} onCancel={() => setMyKnowledgeVisible(false)} width={600} maskClosable okText="确认" cancelText="取消">
        <div className="my-knowledge">
          <div className="my-knowledge-header flex">
            <div className="my-knowledge-left border-r p-2 flex-1">
              <div className="mb-4 flex justify-end">
                <Input.Search className="" style={{ width: 120 }} />
              </div>
              <div>
                {dataSource.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (!selectedMyKnowledge.map((i) => i.key).includes(item.key)) {
                        setSelectedMyKnowledge([...selectedMyKnowledge, item])
                      }
                    }}
                    className={`my-knowledge-item p-1 cursor-pointer hover:bg-[#f3f5f8] ${selectedMyKnowledge.map((i) => i.key).includes(item.key) ? 'text-[#1890ff]' : ''}`}
                  >
                    {renderIcon(item.type)} {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="my-knowledge-right p-2 flex-1">
              <div className="flex justify-between align-center">
                <div>已选知识</div>
                <div
                  style={{
                    opacity: selectedMyKnowledge.length === 0 ? 0 : 1
                  }}
                  className="cursor-pointer hover:text-[#1890ff] text-[#aaa] text-[14px]"
                  onClick={() => setSelectedMyKnowledge([])}
                >
                  清空
                </div>
              </div>
              <div className="my-knowledge-selected">
                {selectedMyKnowledge.map((item, index) => (
                  <div className="my-knowledge-selected-item p-1 hover:bg-[#f3f5f8] hover:text-[#1890ff] group" key={index}>
                    <div className="flex justify-between items-center">
                      <span>
                        {renderIcon(item.type)} {item.name}
                      </span>
                      <i className="iconfont icon-shanchu hidden group-hover:flex text-[#ccc] hover:text-[#1890ff] cursor-pointer" onClick={() => setSelectedMyKnowledge(selectedMyKnowledge.filter((i) => i.key !== item.key))}></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal title="选择企业知识库" open={enterpriseKnowledgeVisible} onOk={() => setEnterpriseKnowledgeVisible(false)} onCancel={() => setEnterpriseKnowledgeVisible(false)} maskClosable okText="确认" cancelText="取消">
        <div className="enterprise-knowledge">
          <div className="enterprise-knowledge-header flex">
            <div className="enterprise-knowledge-left border-r p-2 flex-1">
              <div className="mb-4 flex justify-end">
                <Input.Search className="" style={{ width: 120 }} />
              </div>
              <div>
                {dataSource.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (!selectedEnterpriseKnowledge.map((i) => i.key).includes(item.key)) {
                        setSelectedEnterpriseKnowledge([...selectedEnterpriseKnowledge, item])
                      }
                    }}
                    className={`my-knowledge-item p-1 cursor-pointer hover:bg-[#f3f5f8] ${selectedEnterpriseKnowledge.map((i) => i.key).includes(item.key) ? 'text-[#1890ff]' : ''}`}
                  >
                    {renderIcon(item.type)} {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="enterprise-knowledge-right p-2 flex-1">
              <div className="flex justify-between align-center">
                <div>已选知识</div>
                <div
                  style={{
                    opacity: selectedEnterpriseKnowledge.length === 0 ? 0 : 1
                  }}
                  className="cursor-pointer hover:text-[#1890ff] text-[#aaa] text-[14px]"
                  onClick={() => setSelectedEnterpriseKnowledge([])}
                >
                  清空
                </div>
              </div>
              <div className="enterprise-knowledge-selected">
                {selectedEnterpriseKnowledge.map((item, index) => (
                  <div className="enterprise-knowledge-selected-item p-1 hover:bg-[#f3f5f8] hover:text-[#1890ff] group" key={index}>
                    <div className="flex justify-between items-center">
                      <span>
                        {renderIcon(item.type)} {item.name}
                      </span>
                      <i className="iconfont icon-shanchu hidden group-hover:flex text-[#ccc] hover:text-[#1890ff] cursor-pointer" onClick={() => setSelectedEnterpriseKnowledge(selectedEnterpriseKnowledge.filter((i) => i.key !== item.key))}></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <SplitPane split="vertical" sizes={sizes} onChange={setSizes} sashRender={() => null}>
        <Pane minSize={'30%'}>
          <div className="nw-scrollbar w-full bg-[#eef1f9] left h-full border-r">
            <TinyMCEEditor ref={editorRef} />
          </div>
        </Pane>
        <Pane minSize={'30%'}>
          <div className="right flex flex-col h-full">
            <ConnectedDialogue placeholder="请输入文档相关的问题" hasUploadBtn={false} ref={dialogueRef} autoToBottom={false} sse={true} />
          </div>
        </Pane>
      </SplitPane>
      <div>
        <Popover
          placement="top"
          trigger={['click']}
          overlayInnerStyle={{
            padding: 6
          }}
          content={
            <div>
              {styles.map((item, index) => (
                <span
                  key={index}
                  className="cursor-pointer mr-1 hover:text-[#4096ff]"
                  onClick={() => {
                    console.log(item)
                  }}
                >
                  <span className="mr-1 text-[#ccc]"> {index !== 0 && '|'}</span>
                  {item.label}
                </span>
              ))}
            </div>
          }
        >
          <FloatButton
            style={{
              bottom: 220
            }}
            icon={<i className="iconfont icon-zidongshengcheng"></i>}
            tooltip="生成全文"
            type="primary"
          />
        </Popover>
      </div>
    </div>
  )
}
