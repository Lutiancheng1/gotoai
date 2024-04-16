import History from '@/components/history'
import './index.css'
import pdfIcon from '@/assets/images/pdf-session.svg'
import type { UploadFile, UploadProps } from 'antd'
import { ConfigProvider, Input, message, Modal, Tooltip, Upload } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { RcFile } from 'antd/es/upload'
import { UploadRequestOption, UploadRequestError } from 'rc-upload/lib/interface'
import { http } from '@/utils/axios'
import Toast from '@/components/Toast'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useAsyncEffect, useBoolean, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { delHistoryItem, getConversitionDetail, getHistoryList } from '@/store/action/talkActions'
import { useAppDispatch } from '@/store/hooks'
import { HistoryList } from '@/store/types'
import { menuType, menuWarp } from '@/utils/constants'
import { retry, title } from 'radash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import '@/components/history/index.css'
import { delDocument, getDocumentList } from '@/store/action/documentActions'
import { DocFile, DocumentInitState, initState, toggleIsNewDoc, updateCurrentFile, updateLoading } from '@/store/reducers/document'
import * as pdfjsLib from 'pdfjs-dist'
import SplitPane, { Pane } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'
import Dialogue from '@/components/Dialogue'
import { talkInitialState } from '@/store/reducers/talk'
import UploadErrorImg from '@/assets/images/upload-error.svg'
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.mjs'
const { Dragger } = Upload
type Props = {} & Partial<DocumentInitState> & Partial<talkInitialState>
const Document = ({ isNewDoc, fileList, currentFile, docLoading, conversitionDetailList }: Props) => {
  // 上传loading
  const [messageLoading, setMessageLoading] = useState(false)
  const canvasRef = useRef(null)
  // 百分比进度
  const [progress, setProgress] = useState(0)
  const props: UploadProps = {
    name: 'file',
    accept: '.pdf',
    onChange(info) {
      console.log(info)
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
      // 判断文件格式
      if (e.dataTransfer.files[0].type !== 'application/pdf') {
        Toast.notify({
          type: 'error',
          message: '只能上传pdf文件!'
        })
        return
      }
    },
    beforeUpload(file: RcFile) {
      const isLt30M = file.size / 1024 / 1024 < 30
      if (!isLt30M) {
        Toast.notify({
          type: 'error',
          message: '文件大小不能超过 30MB!'
        })
      }
      return isLt30M
    },
    async customRequest(options: UploadRequestOption) {
      let timer = null
      const { onSuccess, onError, file } = options
      try {
        const formData = new FormData()
        formData.append('file', file)
        dispatch(updateLoading(true))
        timer = setInterval(() => {
          setProgress((progress) => {
            return progress + 3
          })
        }, 100)
        const res = await http.post('/Document/UploadFile?menu=1', formData)
        console.log(res)
        if (res.data) {
          // 调用 onSuccess 回调函数，并将服务器响应作为参数传入
          Toast.notify({
            type: 'success',
            message: `${(file as RcFile).name} 上传成功!`
          })
          onSuccess!(res.data)
          await dispatch(updateLoading(false))
          loadMore(1)
          dispatch(updateCurrentFile({ id: res.data.fileId, path: res.data.url } as DocFile))
          toggleHistory(true)
          setProgress(0)
          clearInterval(timer)
        } else {
          Toast.notify({
            type: 'error',
            message: `${(file as RcFile).name} 上传失败!`
          })
          setUploadError(true)
          onError!(res.data)
          await dispatch(updateLoading(false))
          setProgress(0)
          clearInterval(timer)
        }
      } catch (error) {
        Toast.notify({
          type: 'error',
          message: `${(file as RcFile).name} 上传失败!`
        })
        setUploadError(true)
        // 调用 onError 回调函数，并将错误对象作为参数传入
        onError!(error as UploadRequestError)
        await dispatch(updateLoading(false))
      }
    }
  }
  const dispatch = useAppDispatch()
  // 记录历史折叠状态
  const [historyCollapsed, { toggle: setHistoryCollapsed }] = useBoolean(false)
  // 创建历史折叠按钮的ref
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  // 记录当前菜单的key
  const currentMenuKey = useRef<menuType>(0)
  const [sizes, setSizes] = useState([50, 50])
  const [greeting, setGreeting] = useState('')
  const [uploadError, setUploadError] = useState(false)
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
    if (isNewDoc) {
      return Toast.notify({
        type: 'info',
        message: '已经是最新文档会话'
      })
    }
    dispatch(toggleIsNewDoc(true))
    console.log(currentFile)
  }

  // 删除历史记录某条
  const delHistory = async (e: React.MouseEvent<HTMLElement, MouseEvent>, fileid: string) => {
    e.stopPropagation()
    if (!fileid) return
    const { payload } = await dispatch(delDocument(fileid))
    // 删除成功
    if (payload) {
      Toast.notify({ type: 'success', message: '删除成功' })
      loadMore(1)
      dispatch(toggleIsNewDoc(true))
      toggleHistory(false)
    }
  }

  const loadMore = async (page?: number) => {
    if (!fileList) return
    await dispatch(
      getDocumentList({
        page: page ? page : fileList.pageIndex + 1,
        pageSize: parseInt(window.innerHeight / 80 + '') + 1
      })
    )
  }
  // 设置当前选中文件
  const setCurrentFile = async (item: DocFile) => {
    if (currentFile?.id === item.id) return
    await dispatch(updateCurrentFile(item))
    console.log(item)
    // 加载 PDF 文件
    toggleHistory(true)
    // const loadingTask = pdfjsLib.getDocument(item.path)
    // loadingTask.promise.then(async (pdf) => {
    //   console.log('PDF loaded')

    //   const canvas = canvasRef.current as unknown as HTMLCanvasElement
    //   if (!canvas) return console.log('canvas not found')
    //   const context = canvas.getContext('2d')

    //   let totalHeight = 0

    //   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    //     // 获取每一页
    //     const page = await pdf.getPage(pageNum)
    //     console.log(`Page ${pageNum} loaded`)

    //     const scale = 1.5
    //     const viewport = page.getViewport({ scale })

    //     // 更新 canvas 大小
    //     if (canvas.width < viewport.width) {
    //       canvas.width = viewport.width
    //     }

    //     totalHeight += viewport.height
    //     canvas.height = totalHeight

    //     // 渲染页面
    //     const renderContext = {
    //       canvasContext: context as CanvasRenderingContext2D,
    //       viewport: viewport,
    //       transform: [scale, 0, 0, scale, 0, totalHeight - viewport.height]
    //     }

    //     await page.render(renderContext).promise
    //   }

    //   console.log('All pages rendered')
    // })
  }

  // 页面初始化加载第一页
  useMount(() => {
    loadMore(1)
  })

  // 页面卸载 清空
  useUnmount(() => {
    dispatch(initState())
  })
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    if (hour >= 6 && hour < 9) {
      setGreeting('早上好')
    } else if (hour >= 9 && hour < 12) {
      setGreeting('上午好')
    } else if (hour >= 12 && hour < 14) {
      setGreeting('中午好')
    } else if (hour >= 14 && hour < 18) {
      setGreeting('下午好')
    } else {
      setGreeting('晚上好')
    }
    // console.log(greeting)
  })
  return (
    <div className="document">
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
                      className={`history-item ${currentFile?.id === item.id ? 'active' : ''}`}
                      key={item.id}
                    >
                      <div className="title" title={item.name}>
                        <img src={pdfIcon} alt="" />
                        <span className="line-clamp-2">{item.name}</span>
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
          <div className="expand-bar z-10" style={{ position: 'fixed', width: 0 }}>
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
          <div className="upload-box">
            <div className="title-box">
              <p className="title">文档解读助手</p>
              <p className="sub-title"> 上传一篇文档，可以针对文档内容进行问题解答，迎接更智能、更直观的处理文档方式。 </p>
            </div>
            <div className="sections">
              <div className="section">
                <div className="left">
                  <div className="left-top">
                    <p
                      className="icon"
                      style={{
                        backgroundImage: 'url("https://sfile.chatglm.cn/chatglm/web/document_question_1692873581597.svg")'
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
                    backgroundImage: 'url("https://sfile.chatglm.cn/activeimg/bdms/6582b1f5b02c2c00505ff729")'
                  }}
                />
              </div>
              <div className="section">
                <div className="left">
                  <div className="left-top">
                    <p
                      className="icon"
                      style={{
                        backgroundImage: 'url("https://sfile.chatglm.cn/chatglm/web/document_analyze_1692873581597.svg")'
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
                    backgroundImage: 'url("https://sfile.chatglm.cn/activeimg/bdms/6582b207c49b9d0066b83c56")'
                  }}
                />
              </div>
              <div className="section">
                <div className="left">
                  <div className="left-top">
                    <p
                      className="icon"
                      style={{
                        backgroundImage: 'url("https://sfile.chatglm.cn/chatglm/web/document_translate_1692873581597.svg")'
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
                    backgroundImage: 'url("https://sfile.chatglm.cn/activeimg/bdms/6582b2174464eb0049b088ca")'
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
                                <span>支持PDF文件，文件大小不超过30M，不支持扫描件</span> <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)', marginLeft: 10 }} />
                              </p>
                            </div>
                          </div>
                          <div slot="tip" className="operation">
                            <Input onClick={(e) => e.stopPropagation()} className="upload_input" autoComplete="off" placeholder="输入PDF文档链接" suffix={<i className="input-icon"></i>} />
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
                    <p className="analyze-progress-stop"> 停止 </p>
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
        </div>
      ) : (
        <div className="upload-dialog-container split-pane">
          <SplitPane split="vertical" sizes={sizes} onChange={setSizes} sashRender={() => null}>
            <Pane minSize={'30%'}>
              {/* pdfjs预览 */}
              <div className="left">
                <div className="preview-container" style={{ overflowY: 'scroll', height: '100vh' }}>
                  {/* <canvas ref={canvasRef} /> */}
                  <iframe src={currentFile?.path} title="pdf" className="w-full h-full"></iframe>
                </div>
              </div>
            </Pane>
            <Pane minSize={'30%'}>
              {/* 对话框 */}
              <div className="right flex flex-col">
                <div className="init-page pt-[13px]">
                  <div className="warp">
                    <div className="inner">
                      <div className="init-text">
                        <div className="title"> {greeting}☕️ </div>
                        <div className="idea">
                          <p className="idea-title">文章核心观点</p>
                          <p className="idea-content">
                            这篇文章是一份名为《高级前端工程师大厂面试题》的文档摘要，主要内容包括前端工程师面试的相关题目。文档涵盖了面试所需了解的基础知识、高级知识、框架知识以及编码题等部分。在基础知识部分，涉及到JavaScript基础、CSS基础和HTML基础等；在高级知识部分，包括ES6新特性、网络知识、安全知识等；框架知识部分则涉及Vue、React和Angular等主流框架的原理和用法；编码题部分则包括数据结构和算法等。整体来说，这份文档对于准备前端工程师面试具有很好的参考价值。
                          </p>
                        </div>
                        <div className="example">
                          <div className="example-title">试试以下例子：</div>
                          <div className="example-content insert-prompt">
                            <div className="title">📔 文档总结</div>
                            <div className="desc"> 帮我梳理整个文档的大纲 </div>
                            <div className="desc"> 帮我分析整个文档的知识点 </div>
                            <div className="desc"> 帮我总结这篇文档的关键词，输出不超过10个 </div>
                          </div>
                          <div className="example-content insert-prompt">
                            <div className="title">💼 文档提问</div>
                            <div className="desc"> 这份文档的主要内容和结构是怎样的？ </div>
                            <div className="desc"> 文档中的各个章节都涵盖了哪些核心知识点？ </div>
                            <div className="desc"> 在准备前端工程师面试时，文档中的哪些部分是特别值得关注的？ </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Dialogue placeholder="请输入文档相关的问题" hasUploadBtn={false} />
              </div>
            </Pane>
          </SplitPane>
        </div>
      )}
    </div>
  )
}
// mapStateToProps 函数：将 state 映射到 props
function mapStateToProps(state: RootState) {
  return { ...state.documentSlice, ...state.talkSlice }
}

// mapDispatchToProps 函数：将 dispatch 映射到 props
function mapDispatchToProps(dispatch: AppDispatch) {
  return {}
}
// 使用 connect 连接组件和 Redux store
const ConnectedDocument = connect(mapStateToProps, mapDispatchToProps)(Document)

export default ConnectedDocument
