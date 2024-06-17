import './index.css'
import type { UploadFile, UploadProps } from 'antd'
import { Badge, Button, Checkbox, ConfigProvider, Divider, Input, message, Modal, Popover, Tag, Tooltip, Upload } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { RcFile } from 'antd/es/upload'
import { UploadRequestOption, UploadRequestError } from 'rc-upload/lib/interface'
import { http, httpBaseURL } from '@/utils/axios'
import Toast from '@/components/Toast'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useAsyncEffect, useBoolean, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { menuType, menuWarp } from '@/utils/constants'
import InfiniteScroll from 'react-infinite-scroll-component'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import '@/components/history/index.css'
import { copyDocument, delChatDocument, delDocument, getDocumentList, getDocumentSummary } from '@/store/action/documentActions'
import { DocFile, DocumentInitState, initState, toggleIsNewDoc, updateCurrentFile, updateDocLoading } from '@/store/reducers/document'
import SplitPane, { Pane } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'
import Dialogue from '@/components/Dialogue'
import { LoadingOutlined } from '@ant-design/icons'
import { clearConversitionDetailList, talkInitialState, toggleFirstSend, toggleIsNewChat, updateCurrentId, updateLoading } from '@/store/reducers/talk'
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
import { getConversitionDetail, startChat, createTempChat, saveTempChat, getHistoryList, delHistoryItem } from '@/store/action/talkActions'
import { UserPrompt } from '../Talk'
import { getMenuPrologue } from '@/api/prologue'
import { HistoryList, PrologueInfo, TalkFile } from '@/store/types'
import { useLocation } from 'react-router-dom'
import { ShartChatResp } from '@/types/app'
import { uploadFile } from '@/api/upload'
import WordPreview from '@/components/Docx'
import { isWordFile } from '@/utils/is'
import { isPdfFile } from 'pdfjs-dist'
import { getTokenInfo } from '@/utils/storage'
import type { CheckboxProps, GetProp } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

const { Dragger } = Upload
type Props = {} & Partial<DocumentInitState>
const Document = ({ isNewDoc, tempConversationId, currentFile, docLoading }: Props) => {
  // 百分比进度
  const [progress, setProgress] = useState(0)
  const [modal, contextHolder] = Modal.useModal()
  // 成功上传的文件
  const [successFiles, setSuccessFiles] = useState<UploadFile[]>([])
  // 当前预览的文件信息
  const [previewFile, setPreviewFile] = useState<TalkFile | null>(null)
  // 当前对话附带的文件列表
  const [currentQuestionFiles, setCurrentQuestionFiles] = useState<TalkFile[]>([])
  const [checkedList, setCheckedList] = useState<string[]>()
  const [indeterminate, setIndeterminate] = useState<boolean>(false)
  const [checkAll, setCheckAll] = useState<boolean>(false)
  // 上传完毕按钮是否显示
  const [uploadComplete, setUploadComplete] = useState(false)
  const confirmDelDoc = (file: TalkFile) => {
    if (currentQuestionFiles.length === 1) {
      return modal.confirm({
        title: '提示',
        content: `确定要删除文档「 ${file.name} 」吗?该对话只有一个文档,删除文档后对话也将删除,是否继续?`,
        centered: true,
        okText: '确认',
        cancelText: '取消',
        okType: 'primary',
        maskClosable: true,
        async onOk() {
          delHistory(file.chatId)
        }
      })
    }
    modal.confirm({
      title: '提示',
      content: `确认删除文档「 ${file.name} 」吗?`,
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'primary',
      maskClosable: true,
      async onOk() {
        delQuestionFile(file)
      }
    })
  }
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    let newCheckedList: string[] = []

    if (e.target.checked) {
      newCheckedList = currentQuestionFiles.map((file) => file.fileId)
    } else {
      if (previewFile && checkedList && checkedList.includes(previewFile.fileId)) {
        newCheckedList = [previewFile.fileId]
      }
    }

    setCheckedList(newCheckedList)
    setIndeterminate(false)
    setCheckAll(e.target.checked)
  }

  const onChange = (list: string[]) => {
    if (list.length === 0) {
      // 如果用户取消勾选一个复选框，且没有其他被勾选的复选框，我们不允许用户取消勾选这个复选框
      return Toast.notify({
        type: 'warning',
        message: '最少开启一个阅读文件哦！'
      })
    }

    setCheckedList(list)
    setIndeterminate(!!list.length && list.length < (currentQuestionFiles.length ?? 0))
    setCheckAll(list.length === (currentQuestionFiles?.length ?? 0))
  }
  //  内部上传modal 显示隐藏
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  // 创建 AbortController 实例
  const [abortController, setAbortController] = useState<AbortController | null>(null)
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
  const { historyList, currentConversation } = useAppSelector((state) => state.talkSlice)
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

  const onUploadOk = async () => {
    dispatch(updateLoading(true))
    await dispatch(
      saveTempChat({
        menu: 11,
        conversationId: tempConversationId!
      })
    )
    setUploadComplete(false)
    const { payload } = (await dispatch(
      getHistoryList({
        menu: 11,
        page: 1,
        pageSize: parseInt(window.innerHeight / 80 + '') + 1 // 130
      })
    )) as {
      payload: HistoryList[]
    }
    setTimeout(() => {
      getConversationList(payload[0])
      dispatch(updateLoading(false))
      dispatch(createTempChat(11))
    }, 10)
  }
  const props: UploadProps = {
    name: 'file',
    accept: '.pdf,.doc,.docx',
    multiple: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${getTokenInfo().token}`
    },
    action: httpBaseURL + `/Document/UploadFile?menu=11&conversationid=${currentConversation.conversationId ? currentConversation.conversationId : tempConversationId}`,
    listType: 'picture',
    maxCount: 6,
    iconRender(file, listType) {
      if (file.status === 'uploading') {
        return <LoadingOutlined className="size-7" />
      } else if (listType === 'picture') {
        return <img src={isPdfFile(file.name) ? pdfIcon : WordIcon} alt="" />
      }
    },
    data: async (file) => {
      console.log(file)
      return {}
    },
    async beforeUpload(file) {
      // 判断文件格式
      if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && file.type !== 'application/msword') {
        Toast.notify({
          type: 'error',
          message: '只能上传PDF或Word文件!'
        })
        return false
      }
      if (successFiles.length >= 6 || currentQuestionFiles.length >= 6 || successFiles.length + currentQuestionFiles.length >= 6) {
        Toast.notify({
          type: 'warning',
          message: '多文档阅读最多同时上传6个文件!'
        })
        return false
      }
      return true
    },
    onChange({ file, fileList }) {
      setUploadComplete(false)
      const { status } = file
      if (status === 'done' && file.response.data) {
        setSuccessFiles([...successFiles, file])
        Toast.notify({
          type: 'success',
          message: `${file.name} 上传成功!`
        })
        // 检查fileList中是否所有文件的status都不是uploading
        const isAllUploaded = fileList.every((f) => f.status !== 'uploading')
        if (currentFile && Object.keys(currentFile).length === 0 && isAllUploaded && !currentConversation.conversationId) {
          setUploadComplete(true)
          modal.confirm({
            title: '提示',
            content: '所有文件已上传完毕是否新建文档对话? 取消可继续上传文件',
            centered: true,
            okText: '确认',
            cancelText: '取消',
            okType: 'primary',
            maskClosable: true,
            async onOk() {
              onUploadOk()
            },
            onCancel() {}
          })
        }
      } else if (status === 'done' && file.response.code === -1 && file.response.msg === '请先产生对话！') {
        Toast.notify({
          type: 'warning',
          message: '请先进行对话后再上传文档！'
        })
      } else if (status === 'error') {
        Toast.notify({
          type: 'error',
          message: `${file.name} 上传失败!`
        })
      }
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
    onRemove(file) {
      if (file.status !== 'done' || !file.response.data) return
      setSuccessFiles(successFiles.filter((item) => item.uid !== file.uid))
      successFiles && successFiles.every((file) => file.status !== 'uploading') && setUploadComplete(true)
      dispatch(
        delChatDocument({
          conversationId: tempConversationId!,
          files: [file.response.data.fileId]
        })
      )
    }
  }
  useMount(() => {
    dispatch(createTempChat(11))
  })

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
    setSuccessFiles([])
    setUploadComplete(false)
    setPreviewFile(null)
    setCheckedList([])
    setIndeterminate(false)
    setCheckAll(false)
    setCurrentQuestionFiles([])
    dispatch(toggleIsNewChat(true))
    dispatch(clearConversitionDetailList())
  }

  // 删除历史记录某条
  const delHistory = async (id: number) => {
    if (!id) return
    // loading
    dispatch(updateLoading(true))
    // 删除历史记录
    const isdelete = await dispatch(delHistoryItem(id))
    if (!isdelete) return dispatch(updateLoading(false))

    // 删除成功
    Toast.notify({ type: 'success', message: '删除成功' })
    // 加载第一页
    await loadMore(1)
    // 关闭loading
    dispatch(updateLoading(false))
    if (id === currentConversation.chatId) {
      dispatch(toggleIsNewChat(true))
      dispatch(toggleIsNewDoc(true))
      dispatch(clearConversitionDetailList())
      dispatch(
        updateCurrentId({
          conversationId: '',
          chatId: 0
        })
      )
    }
  }
  //  删除对话附带的某个文档
  const delQuestionFile = async (file: TalkFile) => {
    if (!file.fileId) return
    // 删除历史记录
    const isdelete = await dispatch(
      delChatDocument({
        conversationId: currentConversation!.conversationId,
        files: [file.fileId]
      })
    )
    if (!isdelete) return
    // 删除成功
    Toast.notify({ type: 'success', message: '删除成功' })

    const newQuestionFiles = currentQuestionFiles.filter((item) => item.fileId !== file.fileId)
    setCurrentQuestionFiles(newQuestionFiles)
    if (previewFile?.fileId === file.fileId) {
      const nextFile = newQuestionFiles[0] || null
      setPreviewFile(nextFile)
      setCheckedList(nextFile ? [nextFile.fileId] : [])
    }
  }
  // modal内部继续上传框
  const continueUploadOk = async () => {
    setUploadModalVisible(false)
    setSuccessFiles([])
    const { payload } = (await dispatch(
      getHistoryList({
        menu: 11,
        page: 1,
        pageSize: parseInt(window.innerHeight / 80 + '') + 1 // 130
      })
    )) as {
      payload: HistoryList[]
    }
    const target = payload.find((item) => item.id === currentConversation.chatId)
    setCurrentQuestionFiles(target!.files)
  }
  const loadMore = async (page?: number) => {
    if (!historyList) return
    await dispatch(
      getHistoryList({
        menu: 11,
        page: page ? page : historyList.pageIndex + 1,
        pageSize: parseInt(window.innerHeight / 80 + '') + 1 // 130
      })
    )
  }

  const getConversationList = async (item: HistoryList) => {
    console.log(item)
    // 如果当前id 等于传过来的id 直接return
    if (currentConversation!.chatId === item.id) return
    !historyCollapsed && toggleHistory(true)
    dispatch(toggleIsNewChat(false))
    // 切换当前会话id
    dispatch(
      updateCurrentId({
        conversationId: item.conversationid,
        chatId: item.id
      })
    )
    setCurrentQuestionFiles(item.files)
    setPreviewFile(item.files[0])
    setCheckedList([item.files[0].fileId])
    if (item.files.length === 1) {
      setCheckAll(true)
    } else {
      setIndeterminate(true)
    }
    dispatch(toggleIsNewDoc(false))
    // loading
    dispatch(updateLoading(true))
    // 清空之前的会话详情
    dispatch(clearConversitionDetailList())
    // 获取会话详情
    await dispatch(getConversitionDetail(item.id))
    // 关闭 loading
    dispatch(updateLoading(false))
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
    const { payload: doc } = (await dispatch(copyDocument(11))) as {
      payload: { code: number; msg: string; data: { fileId: string; url: string } }
    }
    if (!doc) return dispatch(updateLoading(false))
    const { payload } = (await dispatch(
      getHistoryList({
        menu: 11,
        page: 1,
        pageSize: parseInt(window.innerHeight / 80 + '') + 1 // 130
      })
    )) as {
      payload: HistoryList[]
    }
    await getConversationList(payload[0])
    await dispatch(updateLoading(false))
    onPrompt({
      content: prompt
    } as UserPrompt)
  }
  // 页面卸载 清空
  useUnmount(() => {
    dispatch(initState())
    dispatch(clearConversitionDetailList())
    dispatch(
      updateCurrentId({
        conversationId: '',
        chatId: 0
      })
    )
    dispatch(toggleIsNewChat(true))
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
    <div className="documents">
      <Modal
        centered
        title="上传文件"
        open={uploadModalVisible}
        destroyOnClose
        okText="完成"
        style={{
          height: 600
        }}
        width={620}
        styles={{
          body: {
            height: 350,
            overflowY: 'scroll'
          }
        }}
        cancelText="取消"
        onOk={continueUploadOk}
        onCancel={() => {
          setSuccessFiles([])
          setUploadModalVisible(false)
        }}
        classNames={{
          body: 'documents'
        }}
      >
        <div className="my_upload upload_sm bg-[#f6f9ff]">
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
                        <span>(多文档阅读最多同时上传6个文件)</span>
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
                </div>
              </div>
            </Dragger>
          </ConfigProvider>
        </div>
      </Modal>
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
                    <div
                      onClick={() => {
                        getConversationList(item)
                      }}
                      className={`history-item justify-between overflow-hidden ${currentConversation?.chatId === item.id ? 'active' : ''}`}
                      key={item.id}
                      style={{ height: '130px' }}
                    >
                      {item.files && item.files.length > 0 && (
                        <>
                          <div className="title font-500" title={item.files[0].name}>
                            {isPdfFile(item.files[0].name) ? <img src={pdfIcon} alt="" /> : <img src={WordIcon} alt="" />}
                            <Badge size="small" count={item.files.length} offset={[10, 0]} color="#2454ff">
                              <span className="line-clamp-1 max-w-[139px]">{item.files[0].name}</span>
                            </Badge>
                          </div>

                          <div className="sub-title flex flex-x-between text-xs" title={item.files[0].summary}>
                            <span className="line-clamp-3">{item.files[0].summary}</span>
                          </div>
                          <div className="time">
                            <span>{item.createTime && item.createTime.replace('T', ' ')}</span>{' '}
                            <i
                              style={{ display: 'none' }}
                              className="iconfont icon-shanchu"
                              onClick={(e) => {
                                e.stopPropagation()
                                delHistory(item.id)
                              }}
                            ></i>
                          </div>
                        </>
                      )}
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
            {previewFile && Object.keys(previewFile).length > 0 && (
              <>
                <Tooltip placement="right" title="切换/勾选文档">
                  <Popover
                    placement="rightTop"
                    overlayInnerStyle={{
                      padding: '10px 10px 10px 8px'
                    }}
                    content={
                      <div className="files_list ml-1  w-52 h-[280px] overflow-hidden">
                        <div className="h-8 flex items-center justify-between p-2 cursor-pointer transition-all rounded-lg hover:bg-[#0000000f]">
                          <span>多选批量阅读</span> <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} />
                        </div>
                        <div className="my-2 h-[1px] w-full bg-[#d4d4d7]"></div>
                        <Checkbox.Group value={checkedList} onChange={onChange} className="w-full">
                          {currentQuestionFiles &&
                            currentQuestionFiles.length > 0 &&
                            currentQuestionFiles.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setPreviewFile(item)
                                }}
                                title={item.name}
                                className={`group mb-2 p-2 w-full h-8 flex items-center justify-between cursor-pointer transition-all rounded-lg hover:bg-[#0000000f] ${previewFile?.fileId === item.fileId ? 'bg-[#dcddde]' : ''}`}
                              >
                                <div className="flex items-center justify-center">
                                  <img className="size-4 group-hover:hidden" src={isPdfFile(item.name) ? pdfIcon : WordIcon} alt="" />
                                  <Tooltip title="删除">
                                    <i
                                      className="iconfont icon-shanchu1 hidden group-hover:inline-block"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        confirmDelDoc(item)
                                      }}
                                    ></i>
                                  </Tooltip>
                                  <span className="ml-1 line-clamp-1 max-w-[152px]">{item.name}</span>
                                </div>
                                <Checkbox className="ml-1" value={item.fileId} key={item.fileId} onClick={(e) => e.stopPropagation()} />
                              </div>
                            ))}
                        </Checkbox.Group>
                      </div>
                    }
                    trigger="click"
                  >
                    <div className="expand-files vh-center bg-white hover:bg-[#3153f5]">
                      <i className="iconfont icon-wuzhi16-qiehuanwendang !text-24"></i>
                    </div>
                  </Popover>
                </Tooltip>
                <Tooltip placement="right" title={'上传文件'}>
                  <div className="expand-upload vh-center bg-white hover:bg-[#3153f5] hover:text-[#fff]" onClick={() => setUploadModalVisible(true)}>
                    <i className="iconfont icon-shangchuanwendang !text-24"></i>
                  </div>
                </Tooltip>
              </>
            )}
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
              <div className="my_upload bg-[#f6f9ff] relative">
                {uploadComplete && (
                  <Button onClick={onUploadOk} type="primary" className="absolute bg-[#1677ff] right-[10px] top-[10px] z-50" icon={<i className="iconfont icon-submit"></i>}>
                    上传完毕
                  </Button>
                )}
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
                              <span>(多文档阅读最多同时上传6个文件)</span>
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
                          <Input onClick={(e) => e.stopPropagation()} className="upload_input" autoComplete="off" placeholder="输入PDF、Word文档链接、链接只支持单个" suffix={<i className="input-icon"></i>} />
                        </div>
                      </div>
                    </div>
                  </Dragger>
                </ConfigProvider>
              </div>
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
                  {previewFile && isPdfFile(previewFile.name) ? previewFile && <PDFViewer hasTools={true} url={previewFile.url} handleMouseUp={handleMouseUp} /> : previewFile && <WordPreview url={previewFile.url} handleMouseUp={handleMouseUp} />}
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
              {previewFile && (
                <div className="right flex flex-col">
                  <Dialogue
                    placeholder="请输入文档相关的问题"
                    hasUploadBtn={false}
                    ref={dialogueRef}
                    autoToBottom={false}
                    sse={true}
                    fileIds={checkedList}
                    initChildren={
                      previewFile && (
                        <div className="init-page mb-5">
                          <div className="warp">
                            <div className="inner">
                              <div className="init-text">
                                <div className="title"> {greeting} </div>
                                <div className="idea">
                                  <p className="idea-title">文章核心观点</p>
                                  <p className="idea-content">{previewFile && previewFile.summary}</p>
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
