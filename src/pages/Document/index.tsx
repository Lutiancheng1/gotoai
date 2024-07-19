import './index.css'
import type { UploadFile, UploadProps } from 'antd'
import { ConfigProvider, Input, message, Modal, Popover, Tooltip, Upload } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { RcFile } from 'antd/es/upload'
import { UploadRequestOption, UploadRequestError } from 'rc-upload/lib/interface'
import { http } from '@/utils/axios'
import Toast from '@/components/Toast'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useAsyncEffect, useBoolean, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useAppDispatch } from '@/store/hooks'
import { menuType, menuWarp } from '@/utils/constants'
import InfiniteScroll from 'react-infinite-scroll-component'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import '@/components/history/index.css'
import { copyDocument, delDocument, getDocumentList, getDocumentSummary } from '@/store/action/documentActions'
import { DocFile, DocumentInitState, initState, toggleIsNewDoc, updateCurrentFile, updateDocLoading } from '@/store/reducers/document'
import SplitPane, { Pane } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'
import Dialogue from '@/components/Dialogue_agent'
import { clearConversitionDetailList, toggleIsNewChat, updateCurrentId, updateLoading } from '@/store/reducers/talk'
import UploadErrorImg from '@/assets/images/upload-error.svg'
import explainIcon from './images/toolbar/explain-hover.svg'
import quoteIcon from './images/toolbar/quote-hover.svg'
import rewriteIcon from './images/toolbar/rewrite-hover.svg'
import summaryIcon from './images/toolbar/summary-hover.svg'
import translateIcon from './images/toolbar/translate-hover.svg'
import document_translate from './images/document_translate.svg'
import document_analyze from './images/document_analyze.svg'
import document_question from './images/document_question.svg'
import document_translate_bg from './images/document_translate_bg.png'
import document_analyze_bg from './images/document_analyze_bg.png'
import document_question_bg from './images/document_question_bg.png'
import WordIcon from '@/assets/images/docx.png'
import pdfIcon from '@/assets/images/pdf-session.svg'
import PDFViewer from '@/components/PDFViewer'
import { getConversitionDetail, startChat } from '@/store/action/talkActions'
import { UserPrompt } from '../Talk'
import { getMenuPrologue } from '@/api/prologue'
import { PrologueInfo } from '@/store/types'
import { useLocation } from 'react-router-dom'
import { ShartChatResp } from '@/types/app'
import { uploadFile } from '@/api/upload'
import WordPreview from '@/components/Docx'
import { isWordFile } from '@/utils/is'
import { isPdfFile } from 'pdfjs-dist'

const { Dragger } = Upload
type Props = {} & Partial<DocumentInitState>
const Document = ({ isNewDoc, fileList, currentFile, docLoading }: Props) => {
  // 百分比进度
  const [progress, setProgress] = useState(0)
  const [modal, contextHolder] = Modal.useModal()

  // 创建 AbortController 实例
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const props: UploadProps = {
    name: 'file',
    accept: '.pdf,.doc,.docx',
    onChange(info) {
      console.log(info)
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
      // 判断文件格式
      if (e.dataTransfer.files[0].type !== 'application/pdf' && e.dataTransfer.files[0].type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && e.dataTransfer.files[0].type !== 'application/msword') {
        Toast.notify({
          type: 'error',
          message: '只能上传PDF或Word文件!'
        })
        return
      }
    },
    async customRequest(options: UploadRequestOption) {
      const { file } = options
      dispatch(updateDocLoading(true))
      const controller = new AbortController()
      setAbortController(controller)
      await uploadFile(
        1,
        file as File,
        controller.signal,
        (progress) => {
          setProgress(progress)
        },
        async (data) => {
          if (data) {
            // 调用 onSuccess 回调函数，并将服务器响应作为参数传入
            Toast.notify({
              type: 'success',
              message: `${(file as RcFile).name} 上传成功!`
            })
            // 如果 侧边栏是展开的 就折叠
            if (historyDivRef.current.style.display === '') {
              toggleHistory(true)
            }
            // 加载文档摘要
            const { payload } = (await dispatch(getDocumentSummary(data.fileId))) as { payload: { data: string } }
            loadMore(1)
            dispatch(updateCurrentFile({ fileid: data.fileId, path: data.url, chatId: data.chat.chatId, conversationid: data.chat.conversationId, summary: payload.data } as unknown as DocFile))
            dispatch(
              updateCurrentId({
                conversationId: data.chat.conversationId,
                chatId: data.chat.chatId
              })
            )
            dispatch(updateDocLoading(false))
            dispatch(toggleIsNewChat(false))
            setProgress(0)
          }
        },
        (error) => {
          Toast.notify({
            type: 'error',
            message: `${error}`
          })
          setUploadError(true)
          // 调用 onError 回调函数，并将错误对象作为参数传入
          dispatch(updateDocLoading(false))
          setProgress(0)
        },
        ['pdf', 'word'],
        30 * 1024 * 1024
      )
    }
  }

  //
  const cancelUpload = () => {
    modal.confirm({
      title: '提示',
      content: '确认取消上传吗?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'primary',
      maskClosable: true,
      async onOk() {
        // 调用 abort 方法取消请求
        if (abortController) {
          abortController.abort()
          await dispatch(updateDocLoading(false))
          setProgress(0)
        }
      }
    })
  }
  const dispatch = useAppDispatch()
  // 记录历史折叠状态
  const [historyCollapsed, { toggle: setHistoryCollapsed }] = useBoolean(false)
  // 创建历史折叠按钮的ref
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  const [sizes, setSizes] = useState([50, 50])
  const [greeting, setGreeting] = useState('')
  const [uploadError, setUploadError] = useState(false)
  const [selectionText, setSelectionText] = useState('')
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [initPrologue, setInitPrologue] = useState<PrologueInfo>()
  const location = useLocation()

  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (defaultRule?: boolean, prompt?: UserPrompt) => Promise<void>; setSendValue: (value: string) => void }>()
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(false, item)
  }
  const setSendValue = (text: string) => {
    dialogueRef.current?.setSendValue(text)
  }
  // 切换历史折叠状态
  const toggleHistory = (flag: Boolean) => {
    console.log(historyCollapsed, 'historyCollapsed')
    if (flag) {
      historyDivRef.current.style.display = 'none'
    } else {
      historyDivRef.current.style.display = ''
    }
    setHistoryCollapsed()
  }
  // 创建新的会话
  const createNewConversation = () => {
    if (isNewDoc) {
      return Toast.notify({
        type: 'info',
        message: '已经是最新文档会话'
      })
    }
    dispatch(toggleIsNewDoc(true))
    dispatch(
      updateCurrentId({
        conversationId: '',
        chatId: 0
      })
    )
  }

  // 删除历史记录某条
  const delHistory = async (e: React.MouseEvent<HTMLElement, MouseEvent>, fileid: string) => {
    e.stopPropagation()
    if (!fileid) return
    dispatch(updateLoading(true))
    const { payload } = await dispatch(delDocument(fileid))
    // 删除成功
    if (payload) {
      Toast.notify({ type: 'success', message: '删除成功' })
      loadMore(1)
      dispatch(toggleIsNewDoc(true))
      dispatch(updateLoading(false))
    } else {
      dispatch(toggleIsNewDoc(true))
      dispatch(updateLoading(false))
    }
    dispatch(
      updateCurrentId({
        conversationId: '',
        chatId: 0
      })
    )
  }

  const loadMore = async (page?: number) => {
    if (!fileList) return
    await dispatch(
      getDocumentList({
        page: page ? page : fileList.pageIndex + 1,
        pageSize: parseInt(window.innerHeight / 130 + '') + 1,
        menu: 1
      })
    )
  }
  // 设置当前选中文件
  const setCurrentFile = async (item: DocFile) => {
    if (currentFile?.fileid === item.fileid) return
    await dispatch(updateCurrentFile(item))
    console.log(item)
    // 加载 PDF 文件
    toggleHistory(true)
    if (item.conversationid) {
      // loading
      dispatch(updateLoading(true))
      // 清空之前的会话详情
      dispatch(clearConversitionDetailList())
      dispatch(toggleIsNewChat(false))
      // 切换当前会话id
      dispatch(
        updateCurrentId({
          conversationId: item.conversationid,
          chatId: item.chatId
        })
      )
      // 获取会话详情
      await dispatch(getConversitionDetail(item.chatId))
      // 关闭 loading
      dispatch(updateLoading(false))
    }
  }

  // 页面初始化加载第一页
  useMount(() => {
    loadMore(1)
  })

  const handleMenuItemClick = (action: string, to?: string | number) => {
    // 润色语言优美一些  改写精简一些 改写扩展丰富一些 改写的通俗易懂
    const rewriteType = ['润色语言优美一些', '改写精简一些', '改写扩展丰富一些', '改写的通俗易懂']
    switch (action) {
      case 'quote':
        setSendValue(selectionText)
        break
      case 'rewrite':
        setSendValue(`请将【${selectionText}】${rewriteType[to as number]}`)
        break
      case 'explain':
        setSendValue(`请解释【${selectionText}】`)
        break
      case 'summarize':
        setSendValue(`请总结【${selectionText}】`)
        break
      case 'translate':
        setSendValue(`请将【${selectionText}】翻译成${to}`)
    }
    window.getSelection()!.removeAllRanges() // 清除当前的选区
    setShowMenu(false)
  }
  //
  const handleMouseUp = (event: MouseEvent) => {
    const toolbarElement = document.getElementById('toolbar')
    if (toolbarElement && toolbarElement.contains(event.target as Node)) {
      // 如果点击的是菜单栏或其子元素，不做任何操作
      return
    }
    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== '') {
      // 获取选中文本的位置
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelectionText(selection.toString())
      // 更新状态以显示菜单
      // 注意：这里的代码需要根据你的状态管理方式适当调整
      setShowMenu(true)
      setMenuPosition({
        y: rect.top - 45,
        x: rect.right
      })
    } else {
      // 没有选中文本，隐藏菜单
      setShowMenu(false)
    }
  }
  const getDefaultDoc = async (prompt: string) => {
    dispatch(updateLoading(true))
    const { payload: doc } = (await dispatch(copyDocument())) as {
      payload: { code: number; msg: string; data: { fileId: string; url: string } }
    }
    if (!doc) return
    // 加载文档摘要
    const { payload: summary } = (await dispatch(getDocumentSummary(doc.data.fileId))) as { payload: { data: string } }
    // 新建对话
    const { payload: chat } = (await dispatch(
      startChat({
        menu: 1,
        prompt: '',
        promptId: 0,
        fileId: doc.data.fileId
      })
    )) as { payload: ShartChatResp }

    let docFIle = { fileid: doc.data.fileId, path: doc.data.url, chatId: chat.chatId, conversationid: chat.conversationId, summary: summary.data } as DocFile
    await dispatch(updateCurrentFile(docFIle))
    await dispatch(
      updateCurrentId({
        conversationId: chat.conversationId,
        chatId: chat.chatId
      })
    )
    await dispatch(toggleIsNewChat(false))
    // 加载 PDF 文件
    await toggleHistory(true)
    await dispatch(updateLoading(false))
    await loadMore(1)
    onPrompt({
      content: prompt
    } as UserPrompt)
  }
  // 页面卸载 清空
  useUnmount(() => {
    dispatch(initState())
  })
  useMount(async () => {
    const res = await getMenuPrologue(menuWarp[location.pathname])
    if (!res.data) return
    setInitPrologue(res.data)
  })
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    if (hour >= 6 && hour < 9) {
      setGreeting('早上好☕')
    } else if (hour >= 9 && hour < 12) {
      setGreeting('上午好🥙')
    } else if (hour >= 12 && hour < 14) {
      setGreeting('中午好🥙')
    } else if (hour >= 14 && hour < 18) {
      setGreeting('下午好☕️')
    } else {
      setGreeting('晚上好🌙')
    }
    // console.log(greeting)
  }, [])
  return (
    <div className="document">
      {contextHolder}
      <>
        <div className={`history animate__animated animate__fadeInLeft animate__faster`} ref={historyDivRef} style={{ zIndex: 22, position: isNewDoc ? 'initial' : 'absolute' }}>
          <div className="histroy-header">
            <div className="left-header-block-up">
              <p className="text font-semibold">{'历史记录'}</p>
              <div className="fold">
                <Tooltip className="cursor-pointer" placement="right" title={'收起历史记录'}>
                  <i className="iconfont icon-zhedie" onClick={() => toggleHistory(true)}></i>
                </Tooltip>
              </div>
            </div>
            <div className="new-session-button-wrap" onClick={() => createNewConversation()}>
              <div className="new-session-button">
                <span>
                  <img src={newSessionIcon} alt="" />
                  新建文档对话
                </span>
              </div>
            </div>
          </div>
          <div className="history-list " id="scrollableDiv">
            {fileList?.empty && (
              <div className=" w-full h-full flex justify-center" style={{ alignItems: 'center' }}>
                <span className="loading loading-dots loading-lg"></span>
              </div>
            )}
            {fileList && fileList.rows.length > 0 && (
              <InfiniteScroll
                dataLength={fileList.recordCount}
                next={loadMore}
                hasMore={fileList.pageCount >= fileList.pageIndex}
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
                {fileList.rows.map((item, index) => {
                  return (
                    <div
                      onClick={() => {
                        setCurrentFile(item)
                      }}
                      className={`history-item justify-between overflow-hidden ${currentFile?.fileid === item.fileid ? 'active' : ''}`}
                      key={item.id}
                      style={{ height: '130px' }}
                    >
                      <div className="title font-500" title={item.name}>
                        {isPdfFile(item.name) ? <img src={pdfIcon} alt="" /> : <img src={WordIcon} alt="" />}
                        <span className="line-clamp-3">{item.name}</span>
                      </div>
                      <div className="sub-title flex flex-x-between text-xs" title={item.summary}>
                        <span className="line-clamp-3">{item.summary}</span>
                      </div>
                      <div className="time">
                        <span>{item.createtime && item.createtime.replace('T', ' ')}</span> <i style={{ display: 'none' }} className="iconfont icon-shanchu" onClick={(e) => delHistory(e, item.fileid)}></i>
                      </div>
                    </div>
                  )
                })}
              </InfiniteScroll>
            )}
          </div>
        </div>
        {historyCollapsed && (
          <div className="expand-bar z-10" style={{ position: 'fixed', width: 0, top: 45 }}>
            <Tooltip placement="right" title={'新建文档对话'}>
              <div className="add-session-icon" onClick={() => createNewConversation()}></div>
            </Tooltip>

            <Tooltip placement="right" title={'展开历史记录'}>
              <div className="expand-icon" onClick={() => toggleHistory(false)}></div>
            </Tooltip>
          </div>
        )}
      </>
      {isNewDoc ? (
        <div className="upload-container">
          {initPrologue && (
            <div className="upload-box">
              <div className="title-box">
                <p className="title">文档解读助手</p>
                <p className="sub-title"> {initPrologue.content} </p>
              </div>
              <div className="sections">
                <div className="section" onClick={() => getDefaultDoc('GotoAI 是什么？')}>
                  <div className="left">
                    <div className="left-top">
                      <p
                        className="icon"
                        style={{
                          backgroundImage: `url(${document_question})`
                        }}
                      />
                      <p className="text">文档提问</p>
                    </div>
                    <p className="left-middle">对文章提问，大模型利用文章内容回答</p>
                    <p className="left-bottom" />
                  </div>
                  <div
                    className="right"
                    style={{
                      backgroundImage: `url(${document_question_bg})`
                    }}
                  />
                </div>
                <div className="section" onClick={() => getDefaultDoc('请一句话总结GotoAI的优势')}>
                  <div className="left">
                    <div className="left-top">
                      <p
                        className="icon"
                        style={{
                          backgroundImage: `url(${document_analyze})`
                        }}
                      />
                      <p className="text">文档总结</p>
                    </div>
                    <p className="left-middle">提取文章核心观点，要求简明扼要</p>
                    <p className="left-bottom" />
                  </div>
                  <div
                    className="right"
                    style={{
                      backgroundImage: `url(${document_analyze_bg})`
                    }}
                  />
                </div>
                <div className="section" onClick={() => getDefaultDoc('请将总结GotoAI解决了什么，然后将其翻译成英文')}>
                  <div className="left">
                    <div className="left-top">
                      <p
                        className="icon"
                        style={{
                          backgroundImage: `url(${document_translate})`
                        }}
                      />
                      <p className="text">文档翻译</p>
                    </div>
                    <p className="left-middle">选择文章中的内容翻译为英文</p>
                    <p className="left-bottom" />
                  </div>
                  <div
                    className="right"
                    style={{
                      backgroundImage: `url(${document_translate_bg})`
                    }}
                  />
                </div>
              </div>
              {!uploadError ? (
                <>
                  <div className="my_upload bg-[#f6f9ff]" style={{ display: !docLoading ? '' : 'none' }}>
                    <ConfigProvider
                      theme={{
                        components: {
                          Upload: {
                            colorBorder: '#2454ff'
                          }
                        }
                      }}
                    >
                      <Dragger {...props}>
                        <div className="upload-outer-box">
                          <div className="upload-inner-box">
                            <div className="tip">
                              <div className="tip-left" />
                              <div className="tip-right">
                                <p className="tip-right-title">
                                  <span className="blue">点击上传</span>
                                  <span>，</span>
                                  <span>或拖动文档到这里</span>
                                </p>
                                <p className="tip-right-subtitle">
                                  <span>支持PDF、Word文件，文件大小不超过30M，不支持扫描件</span>
                                  <Popover
                                    rootClassName="upload-popover"
                                    placement="right"
                                    content={
                                      <div className="content" onClick={(e) => e.stopPropagation()}>
                                        <p className="title">文档上传规范</p>
                                        <p className="content-item">
                                          <span className="content-icon" />
                                          <span className="content-text">支持文件类型：PDF、Word</span>
                                        </p>
                                        <p className="content-item">
                                          <span className="content-icon" />
                                          <span className="content-text">文件大小：小于30M</span>
                                        </p>
                                        <p className="content-item">
                                          <span className="content-icon" />
                                          <span className="content-text">内容要求：一栏排版、文字清晰</span>
                                        </p>
                                      </div>
                                    }
                                  >
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)', marginLeft: 10 }} />
                                  </Popover>
                                </p>
                              </div>
                            </div>
                            <div slot="tip" className="operation">
                              <Input onClick={(e) => e.stopPropagation()} className="upload_input" autoComplete="off" placeholder="输入PDF、Word文档链接" suffix={<i className="input-icon"></i>} />
                            </div>
                          </div>
                        </div>
                      </Dragger>
                    </ConfigProvider>
                  </div>
                  <div className="analyze-box" style={{ display: docLoading ? '' : 'none' }}>
                    <div className="analyze-title">
                      <div className="analyze-title-text">
                        <p className="analyze-doc-icon" />
                        <p className="analyze-doc-text">正在学习，请勿关闭当前网页...</p>
                      </div>
                      <video src={require('@/assets/video/analyze.mp4')} autoPlay loop muted className="analyze-icon" />
                    </div>
                    <div className="analyze-progress overflow-hidden">
                      <p className="analyze-progress-text" />
                      <p className="analyze-progress-stop" onClick={cancelUpload}>
                        停止
                      </p>
                      <div className="analyze-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="upload-status-outer-box">
                  <div className="upload-status-inner-box">
                    <img src={UploadErrorImg} alt="" />
                    <p className="text">文档解析失败</p>
                    <p className="operate-button error-button" onClick={() => setUploadError(false)}>
                      上传其他文档
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="upload-dialog-container split-pane">
          <SplitPane split="vertical" sizes={sizes} onChange={setSizes} sashRender={() => null}>
            <Pane minSize={'30%'}>
              {/* pdfjs预览 */}
              <div className="left relative">
                <div className="preview-container nw-scrollbar bg-[#d4d4d7]" style={{ overflowY: 'scroll', height: '100vh' }}>
                  {currentFile && isPdfFile(currentFile.path) ? <PDFViewer hasTools={true} url={currentFile.path} handleMouseUp={handleMouseUp} /> : <WordPreview url={currentFile!.path} handleMouseUp={handleMouseUp} />}
                </div>
                <div
                  id="toolbar"
                  style={{
                    display: showMenu ? 'flex' : 'none',
                    top: menuPosition.y,
                    position: 'fixed',
                    left: 400,
                    zIndex: 9999,
                    margin: '0px auto'
                  }}
                >
                  <p id="quote" onClick={() => handleMenuItemClick('quote')}>
                    <img alt="" height="16px" src={quoteIcon} width="16px" />
                    <span>引用</span>
                  </p>
                  <p id="rewrite">
                    <img alt="" height="16px" src={rewriteIcon} width="16px" />
                    <span>改写</span>
                    <span
                      className="type"
                      style={{
                        bottom: 'auto',
                        top: '46px'
                      }}
                    >
                      {['润色美化', '精简语言', '扩展丰富', '通俗处理'].map((item, index) => (
                        <span key={index} id={`rewrite-${index}`} onClick={() => handleMenuItemClick('rewrite', index)}>
                          {item}
                        </span>
                      ))}
                    </span>
                  </p>
                  <p id="explain" onClick={() => handleMenuItemClick('explain')}>
                    <img alt="" height="16px" src={explainIcon} width="16px" />
                    <span>解释</span>
                  </p>
                  <p id="summary" onClick={() => handleMenuItemClick('summarize')}>
                    <img alt="" height="16px" src={summaryIcon} width="16px" />
                    <span>总结</span>
                  </p>
                  <p id="translate">
                    <img alt="" height="16px" src={translateIcon} width="16px" />
                    <span>翻译</span>
                    <span
                      className="type"
                      style={{
                        bottom: 'auto',
                        top: '46px'
                      }}
                    >
                      {['中文', '英语', '日语', '韩语', '法语', '德语'].map((item, index) => (
                        <span key={index} id={`translate-${index}`} onClick={() => handleMenuItemClick('translate', item)}>
                          {item}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>
              </div>
            </Pane>
            <Pane minSize={'30%'}>
              {/* 对话框 */}
              {currentFile && (
                <div className="right flex flex-col">
                  <Dialogue
                    placeholder="请输入文档相关的问题"
                    hasUploadBtn={false}
                    ref={dialogueRef}
                    autoToBottom={false}
                    sse={true}
                    initChildren={
                      currentFile && (
                        <div className="init-page mb-5">
                          <div className="warp">
                            <div className="inner">
                              <div className="init-text">
                                <div className="title"> {greeting} </div>
                                <div className="idea">
                                  <p className="idea-title">文章核心观点</p>
                                  <p className="idea-content">{currentFile && currentFile.summary}</p>
                                </div>
                                <div className="example">
                                  <div className="example-title">试试以下例子：</div>
                                  <div className="example-content insert-prompt">
                                    <div className="title">📔 文档总结</div>
                                    {['帮我梳理整个文档的大纲', '帮我分析整个文档的知识点', '帮我总结这篇文档的关键词，输出不超过10个'].map((item, index) => {
                                      return (
                                        <div
                                          className="desc"
                                          key={index}
                                          onClick={() =>
                                            onPrompt({
                                              content: item
                                            } as UserPrompt)
                                          }
                                        >
                                          {item}
                                        </div>
                                      )
                                    })}
                                  </div>
                                  <div className="example-content insert-prompt">
                                    <div className="title">💼 文档提问</div>
                                    {['这份文档的主要内容和结构是怎样的？', '文档中的各个章节都涵盖了哪些核心知识点？', '文档的核心观点是什么？'].map((item, index) => {
                                      return (
                                        <div
                                          className="desc"
                                          key={index}
                                          onClick={() =>
                                            onPrompt({
                                              content: item
                                            } as UserPrompt)
                                          }
                                        >
                                          {item}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  />
                </div>
              )}
            </Pane>
          </SplitPane>
        </div>
      )}
    </div>
  )
}
// mapStateToProps 函数：将 state 映射到 props
function mapStateToProps(state: RootState) {
  return state.documentSlice
}

// mapDispatchToProps 函数：将 dispatch 映射到 props
function mapDispatchToProps(dispatch: AppDispatch) {
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedDocument = connect(mapStateToProps, mapDispatchToProps)(Document)

export default ConnectedDocument
