import { useKeyPress, useMount, useUnmount } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { initialState as initWritingData, WritingJson, updateCollapsed, updateWritingData } from '@/store/reducers/writing'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button, Form, Input, Modal, Select, Upload } from 'antd'
import { CategorysDetail, List, ListDetail } from '../types'
import FormItem from 'antd/es/form/FormItem'
import TextArea from 'antd/es/input/TextArea'
import './index.css'
import { RcFile, UploadRequestOption } from 'rc-upload/lib/interface'
import { formatMap, uploadFile } from '@/api/upload'
import Toast from '@/components/Toast'
import { MessageInfo } from '@/store/types'
import { addChatMessages, AddChatMessagesData, startChat } from '@/store/action/talkActions'
import { ShartChatResp } from '@/types/app'
import { UUID } from '@/utils/libs'
import dayjs from 'dayjs'
import { getTokenInfo } from '@/utils/storage'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { imgLazyload } from '@mdit/plugin-img-lazyload'
import { handleCopyClick } from '@/components/Dialogue'
import { transformObject } from '@/utils'
type WritingDetailProps = {}
let sse = true
let currentMenuKey = 10
let currentConversation = {
  conversationId: '',
  chatId: 0
}
const WritingDetail: React.FC<WritingDetailProps> = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { robotId } = useParams()
  const [form] = Form.useForm()
  const [modal, contextHolder] = Modal.useModal()
  const WritingData = useAppSelector((state) => state.writingSlice)
  // 当前选中的分类详情
  const [currentCategoryDetail, setCurrentCategoryDetail] = useState<CategorysDetail>()
  // 当前上传完成的文件
  const [currentFile, setCurrentFile] = useState<{ file: File; url: string } | null>()
  // loading
  const [loading, setLoading] = useState(false)
  // 是否初始化
  const [isInit, setIsInit] = useState(true)
  const scrollBox = useRef<HTMLDivElement>(null)
  const [conversitionList, setConversitionList] = useState<MessageInfo[]>()
  const [currentUUID, setCurrentUUID] = useState('')
  const [controller, setController] = useState<AbortController>()
  const onBack = () => {
    navigate('/writing')
  }
  const handleAddHistory = (item: List) => {
    // 如果已经存在
    if (WritingData.history.list.find((historyItem) => historyItem.uid === item.uid)) return
    dispatch(
      updateWritingData({
        ...WritingData,
        history: {
          ...WritingData.history,
          list: [item, ...WritingData.history.list]
        }
      })
    )
  }
  const scrollBottom = () => {
    // 滚动到底部
    if (scrollBox.current) {
      scrollBox.current.scrollTo({
        top: scrollBox.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }
  // 各分类list 点击
  const getItemDetail = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uid: string, type: string) => {
    e.stopPropagation()
    navigate(`/writing/${uid}`, {
      state: {
        type
      }
    })
  }
  // 重置
  const onReset = () => {
    modal.confirm({
      title: '提示',
      content: '确认要清空输入的内容吗?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      maskClosable: true,
      onOk() {
        form.resetFields()
        setCurrentFile(undefined)
      }
    })
  }
  // 保存
  const onSubmit = async () => {
    if (loading) return Toast.notify({ type: 'info', message: '请等待上条信息响应完成' })
    const values = form.getFieldsValue()
    // 遍历 values 对象
    for (let key in values) {
      // 如果某一项没有值，就取它的默认值
      if (!values[key]) {
        const matchedItem = currentCategoryDetail?.list.find((item) => item.input_name === key)
        // 如果找到了匹配的项，就使用这一项的 default 值
        if (matchedItem) {
          form.setFieldsValue({
            [key]: matchedItem.default
          })
        }
      }
    }
    console.log(form.getFieldsValue())
    console.log(currentCategoryDetail)
    setLoading(true)
    let prompt = '帮我生成一篇' + currentCategoryDetail?.title + '；' + currentCategoryDetail?.list.map((item) => item.title + '：' + form.getFieldValue(item.input_name)).join('；')

    if (isInit) {
      const targetList = initWritingData.category.flatMap((item) => item.list).find((list) => list.uid === robotId)!
      handleAddHistory(targetList)

      // 创建一个新的会话
      const { payload } = (await dispatch(
        startChat({
          menu: currentMenuKey,
          prompt:
            '你是一个文书写作助手,精通各种类型文书写作；包括但不限于:日常办公写作、机关单位写作、分析/研究报告、教育/论文等等各大分类你均可完成。精通各种类型文书写作； 为企业和机关单位提供一个高效的文书撰写和编辑平台，通过智能化的写作辅助和定制化内容生成，帮助用户在各种文书工作中节省时间、提高效率，并确保文书的品质和专业性。格式丰富一点的返回给用户；',
          promptId: 0
        })
      )) as { payload: ShartChatResp }
      currentConversation = payload
      console.log('是新会话,创建一个新会话 ID为:', payload)
      console.log(currentConversation, '更新questionId为新会话id')
      setIsInit(false)
    }
    let uuid = UUID()
    setConversitionList((prevList) => [
      {
        id: 0,
        UUID: uuid,
        chatId: currentConversation!.chatId,
        content: '',
        isLoading: true,
        type: 1,
        resource: '',
        createtime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      },
      ...(prevList || [])
    ])
    if (sse) {
      const newController = new AbortController()
      setController(newController)
      const signal = newController.signal
      try {
        const url = `${process.env.REACT_APP_BASE_URL}/Chat/ChatMessagesEvent`
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
            conversationId: currentConversation!.conversationId,
            menu: 10,
            query: prompt,
            inputs: transformObject(form.getFieldsValue())
          }),
          onopen(response) {
            // 建立连接的回调
            return Promise.resolve()
          },
          onmessage(msg) {
            // 接收一次数据段时回调，因为是流式返回，所以这个回调会被调用多次
            if (msg.event === 'message') {
              // 处理数据段
              let { message, files } = JSON.parse(msg.data) as unknown as AddChatMessagesData
              setConversitionList((prev) => {
                return prev?.map((item) => {
                  if (item.UUID === uuid) {
                    return {
                      ...item,
                      content: item.content + message,
                      isLoading: false
                    }
                  }
                  return item
                }) as MessageInfo[]
              })
              // 进行连接正常的操作
            } else if (msg.event === 'message_end') {
              setLoading(false)
              newController.abort()
              setCurrentUUID('')
            }
          },
          onclose() {
            // 正常结束的回调
            newController.abort() // 关闭连接
            setLoading(false)
          },
          onerror(err) {
            // 连接出现异常回调
            // 必须抛出错误才会停止
            throw err
          }
        })
      } catch (err) {
        setLoading(false)
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
            conversationId: currentConversation!.conversationId,
            menu: currentMenuKey,
            query: prompt
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
          setConversitionList((prev) => {
            return prev?.map((item) => {
              if (item.UUID === uuid) {
                return {
                  ...item,
                  content: message,
                  isLoading: false
                }
              }
              return item
            }) as MessageInfo[]
          })
          setLoading(false)
          // 滚动到底部
        } else {
          setLoading(false)
          return Toast.notify({ type: 'error', message: '出错了' })
        }
      } catch (error) {
        setLoading(false)
        Toast.notify({
          type: 'error',
          message: '网络错误'
        })
      }
    }
  }
  // 监听回车
  useKeyPress('ctrl.enter', onSubmit)
  const customRequest = async (options: UploadRequestOption, item: ListDetail) => {
    console.log(item)
    const { max_size, input_name, accept } = item
    const types = Object.keys(formatMap).filter((key) => formatMap[key].some((mimeType) => accept.split(',').includes(mimeType)))
    const { file } = options
    const controller = new AbortController()
    await uploadFile(
      8,
      file as File,
      controller.signal,
      (progress) => {},
      async (data) => {
        if (data) {
          // 调用 onSuccess 回调函数，并将服务器响应作为参数传入
          form.setFieldsValue({
            [input_name]: (file as RcFile).name
          })
          setCurrentFile({
            file: file as RcFile,
            url: data.url
          })
          console.log(form.getFieldsValue())

          Toast.notify({
            type: 'success',
            message: `${(file as RcFile).name} 上传成功!`
          })
        }
      },
      (error) => {
        Toast.notify({
          type: 'error',
          message: `${error}`
        })
      },
      types,
      max_size * 1024 * 1024
    )
  }
  // 复制事件
  useMount(() => {
    const state = location.state
    if (!state) return
    const { type } = state
    if (!type) return
    dispatch(
      updateCollapsed({
        key: type,
        collapsed: true
      })
    )
  })

  useEffect(() => {
    if (!robotId) return
    WritingJson.details[robotId] && setCurrentCategoryDetail(WritingJson.details[robotId])
    if (currentCategoryDetail) {
      form.resetFields()
    }
    setIsInit(true)
    setConversitionList([])
    currentConversation = {
      conversationId: '',
      chatId: 0
    }
    dispatch(updateCollapsed({ key: location.state.type, collapsed: true, closeOthers: true }))
  }, [robotId, currentCategoryDetail, form, dispatch, location.state.type])

  useUnmount(() => {
    dispatch(
      updateWritingData({
        ...initWritingData
      })
    )
  })
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
  return (
    <div className="w-full h-full">
      {contextHolder}
      <div className="w-full text-[#1a2029] h-[91px] bg-white p-2 border-b-[1px] border-[rgba(0,0,0,0.1)]">
        <p className="text-28 font-600 *:leading-7">AI 文书写作助手</p>
        <p className="font-400 text-14 mt-3 ">为企业和机关单位提供一个高效的文书撰写和编辑平台，通过智能化的写作辅助和定制化内容生成，帮助用户在各种文书工作中节省时间、提高效率，并确保文书的品质和专业性。</p>
      </div>
      <div className="w-full h-[calc(100vh-113px)] bg-[#F3F5F8] flex items-center justify-center overflow-hidden">
        {/*  分类树 */}
        <div className="w-[200px] h-full bg-[#fff] border-r-[1px] border-[rgba(0,0,0,0.1)] flex flex-col">
          {/* 头部 返回按钮 */}
          <div className="flex items-center w-full h-[48px] pl-[16px] cursor-pointer" onClick={onBack}>
            <div className="text-14 font-medium">
              <span className=" ">
                <i className="iconfont icon-fanhui !text-18 font-600 w-2 h-[14px] mr-2 align-middle" />
                返回工作台
              </span>
            </div>
          </div>
          {/* 树 */}
          <div className="flex-grow overflow-y-scroll nw-scrollbar mr-[2px] h-[calc(100vh-161px)]">
            {/* 最近使用 */}
            {WritingData && WritingData.history && WritingData.history.list && WritingData.history.list.length > 0 && (
              <div onClick={() => dispatch(updateCollapsed({ key: WritingData.history.title, collapsed: !WritingData.history.isExpanded }))} className={`w-full overflow-hidden rounded-[4px] bg-[#fff] cursor-pointer ${WritingData.history.isExpanded ? 'h-auto' : ' h-10'}`}>
                <div className="flex items-center h-[40px] bg-[#fff] pl-3 pr-[6px] py-[10px]">
                  <div
                    className="bg-contain bg-center bg-no-repeat relative w-[20px] h-[20px] rounded-[2px] mx-[8px]"
                    style={{
                      backgroundImage: `url(${WritingData.history.icon_small})`
                    }}
                  />
                  <div className="flex-grow text-14 text-[#222]">{WritingData.history.title}</div>
                  <i className={`iconfont ${WritingData.history.isExpanded ? 'icon-shang' : 'icon-xia'} w-[20px] h-[20px] transform !text-10`} />
                </div>
                {WritingData.history.list.map((item) => {
                  return (
                    <div onClick={(e) => getItemDetail(e, item.uid, 'history')} key={item.uid} className={`w-[184px] h-8 my-1 flex items-center group relative mx-2 pl-8 rounded-4px hover:bg-[rgba(243,245,248,0.5)] ${robotId === item.uid ? '!bg-[#F3F5F8] font-bold' : ''}`}>
                      <img alt="" className="w-[20px] h-[20px] rounded-[4px]" src={item.icon} />
                      <span className="text-14 text-[#222] leading-[20px] h-[20px] ml-3 truncate">{item.nickname}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {/* 收藏 */}
            {WritingData && WritingData.wish && WritingData.wish.list && WritingData.wish.list.length > 0 && (
              <div onClick={() => dispatch(updateCollapsed({ key: WritingData.wish.title, collapsed: !WritingData.wish.isExpanded }))} className={`w-full overflow-hidden rounded-[4px] bg-[#fff] cursor-pointer ${WritingData.wish.isExpanded ? 'h-auto' : ' h-10'}`}>
                <div className="flex items-center h-[40px] bg-[#fff] pl-3 pr-[6px] py-[10px]">
                  <div
                    className="bg-contain bg-center bg-no-repeat relative w-[20px] h-[20px] rounded-[2px] mx-[8px]"
                    style={{
                      backgroundImage: `url(${WritingData.wish.icon_small})`
                    }}
                  />
                  <div className="flex-grow text-14 text-[#222]">{WritingData.wish.title}</div>
                  <i className={`iconfont ${WritingData.wish.isExpanded ? 'icon-shang' : 'icon-xia'} w-[20px] h-[20px] transform !text-10`} />
                </div>
                {WritingData.wish.list.map((item) => {
                  return (
                    <div onClick={(e) => getItemDetail(e, item.uid, 'wish')} key={item.uid} className={`w-[184px] h-8 my-1 flex items-center group relative mx-2 pl-8 rounded-4px hover:bg-[rgba(243,245,248,0.5)] ${robotId === item.uid ? '!bg-[#F3F5F8] font-bold' : ''}`}>
                      <img alt="" className="w-[20px] h-[20px] rounded-[4px]" src={item.icon} />
                      <span className="text-14 text-[#222] leading-[20px] h-[20px] ml-3 truncate">{item.nickname}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {/* 所有分类 */}
            {WritingData &&
              WritingData.category.length > 0 &&
              WritingData.category.map((item) => {
                return (
                  <div key={item.title} onClick={() => dispatch(updateCollapsed({ key: item.title, collapsed: !item.isExpanded }))} className={`w-full overflow-hidden rounded-[4px] bg-[#fff] cursor-pointer ${item.isExpanded ? 'h-auto' : ' h-10'}`}>
                    <div className="flex items-center h-[40px] bg-[#fff] pl-3 pr-[6px] py-[10px]">
                      <div
                        className="bg-contain bg-center bg-no-repeat relative w-[20px] h-[20px] rounded-[2px] mx-[8px]"
                        style={{
                          backgroundImage: `url(${item.icon_small})`
                        }}
                      />
                      <div className="flex-grow text-14 text-[#222]">{item.title}</div>
                      <i className={`iconfont ${item.isExpanded ? 'icon-shang' : 'icon-xia'} w-[20px] h-[20px] transform !text-10`} />
                    </div>
                    {item.list.map((list) => {
                      return (
                        <div onClick={(e) => getItemDetail(e, list.uid, item.title)} key={list.uid} className={`w-[184px] h-8 my-1 flex items-center group relative mx-2 pl-8 rounded-4px hover:bg-[rgba(243,245,248,0.5)] ${robotId === list.uid ? '!bg-[#F3F5F8] font-bold' : ''}`}>
                          <img alt="" className="w-[20px] h-[20px] rounded-[4px]" src={list.icon} />
                          <span className="text-14 text-[#222] leading-[20px] h-[20px] ml-3 truncate">{list.nickname}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
          </div>
        </div>
        {/*  内容 */}
        <div className="w-full h-full bg-[#F3F5F8] flex items-center justify-center overflow-hidden">
          {/*  详情页 表单 */}
          {currentCategoryDetail && (
            <div className="flex flex-col w-1/3 flex-grow h-full bg-[#fff]">
              <div className="w-full h-full flex flex-col justify-center items-center pb-6">
                {/* 头部 */}
                <header className="flex items-center w-full h-[72px] pl-4 border-b-[1px] border-[rgba(0,0,0,0.1)] cursor-pointer">
                  <img alt="" className="w-7 h-7 rounded-[6px] mx-[10px]" src={currentCategoryDetail.icon} />
                  <div className="text-20 font-medium">{currentCategoryDetail.title}</div>
                </header>
                {/* 表单 */}
                <div className="w-full px-6 pt-6 h-0 flex-grow overflow-y-scroll nw-scrollbar mr-[2px]">
                  <Form autoComplete="off" layout="vertical" form={form}>
                    {currentCategoryDetail.list.map((item) => {
                      return (
                        <div key={item.title}>
                          {item.input_type.startsWith('text') && (
                            <FormItem label={item.title} name={item.input_name}>
                              <TextArea className="prompt-textarea" placeholder={item.placeholder} showCount maxLength={parseInt(item.input_type.split('_')[1])} autoSize={{ minRows: Math.min(Math.ceil(parseInt(item.input_type.split('_')[1]) / 15), 4) }} />
                            </FormItem>
                          )}
                          {item.input_type.startsWith('select') && (
                            <FormItem label={item.title} name={item.input_name} initialValue={item.default || item.option?.[0]}>
                              <Select options={item.option?.map((option) => ({ label: option, value: option }))} />
                            </FormItem>
                          )}
                          {item.input_type.startsWith('tab') && (
                            <FormItem label={item.title} name={item.input_name} initialValue={item.default}>
                              <Select mode="tags" style={{ width: '100%' }} placeholder={item.placeholder} open={false} suffixIcon={null} notFoundContent={null} showSearch={false} maxCount={20} />
                            </FormItem>
                          )}
                          {item.input_type.startsWith('file') && (
                            <FormItem label={item.title} name={item.input_name} className="no_up_list">
                              <Upload fileList={[]} accept={item.accept} customRequest={(options) => customRequest(options, item)}>
                                <Input
                                  className="cursor-pointer"
                                  value={currentFile?.file.name}
                                  readOnly
                                  size="large"
                                  addonAfter={
                                    currentFile ? (
                                      <i
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setCurrentFile(undefined)
                                        }}
                                        className="iconfont icon-shanchu"
                                      ></i>
                                    ) : null
                                  }
                                  addonBefore={item.btn_text}
                                  placeholder={item.placeholder}
                                />
                              </Upload>
                            </FormItem>
                          )}
                        </div>
                      )
                    })}
                  </Form>
                  <div onClick={onReset} className="flex justify-center text-[#5E6770] cursor-pointer items-center">
                    <i className="iconfont icon-shanchu"></i>
                    <span className="ml-[5px]">清空录入</span>
                  </div>
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-center px-6 bg-[#fff] mt-2 z-[100] w-full h-11">
                  <Button loading={loading} onClick={onSubmit} type="primary" className="flex justify-center items-center !w-full !h-11 text-[#fff] font-semibold bg-[#2E65FF] !rounded-[4px] !text-16">
                    立即生成 <span className="w-[102px] py-1 px-3 ml-3 rounded-[4px]">Ctrl + Enter</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* 右侧内容输出区域 */}
          <div className="document-container flex flex-col w-2/3 flex-grow h-full">
            {/* init */}
            {isInit ? (
              <div className="flex flex-col gap-[16px] size-full p-6 bg-[#F3F5F8]">
                <div className="relative w-full h-full flex flex-col flex-grow">
                  <div className="absolute inset-0 size-full vh-center">
                    <div className="flex items-center">
                      <i className="iconfont icon-zuo !text-40 no-draw-arrow"></i>
                      <span className="text-24 font-bold ml-[10px]">开始生成</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 输出区域
              <div className="pl-6 py-6 pr-[18px] h-0 flex-grow overflow-y-scroll nw-scrollbar" id="prompt-content-wrap" ref={scrollBox}>
                {conversitionList &&
                  conversitionList.length > 0 &&
                  conversitionList.map((item) => {
                    return (
                      <div key={item.id} className="flex flex-col mb-4">
                        <div className="flex-1 bg-[#fff] flex flex-col text-[#222] text-15 leading-[22px] px-6 py-4">
                          <div
                            className="whitespace-pre-wrap break-all text-15 leading-[26px]"
                            dangerouslySetInnerHTML={{
                              __html: md.render(item.isLoading ? '<span class="loading loading-dots loading-xs"></span>' : item.content)
                            }}
                          ></div>
                          <div className="flex items-center mt-[15px] pt-[15px] text-14 border-dashed border-t-[1px] border-[rgba(105,117,126,0.3)] justify-end">
                            <div onClick={() => handleCopyClick(item.content)} className="flex justify-center items-center w-[76px] h-[32px] text-[#0E6CF2] rounded-[4px] cursor-pointer border-[1px] border-[#0E6CF2] group hover:bg-[#0E6CF2] hover:text-[#fff] bg-[#fff]">
                              <i className="iconfont icon-icon_fuzhi !mr-[5px]"></i>
                              复制
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WritingDetail
