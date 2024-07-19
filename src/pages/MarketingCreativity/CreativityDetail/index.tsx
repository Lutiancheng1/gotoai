import { useAsyncEffect, useKeyPress, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { initialState as initCreativityData, initCurrentCategory, updateCollapsed } from '@/store/reducers/creativity'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button, FloatButton, Form, Input, Modal, Select, Upload } from 'antd'
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
import { handleCopyClick } from '@/components/Dialogue_agent'
import { CategoryChildrenList, CategoryDetailList, getCategoryDetail, getHistoryList, getMarketingCategoryList, getWishList } from '@/store/action/creativityAction'
import Loading from '@/components/loading'
import { transformObject } from '@/utils'
import useForm from 'antd/es/form/hooks/useForm'
import { renderMarkdown } from '@/components/MdRender/markdownRenderer'
type CreativityDetailProps = {}
let sse = true
let currentMenuKey = 9
let currentConversation = {
  conversationId: '',
  chatId: 0
}

const CreativityDetail: React.FC<CreativityDetailProps> = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [form] = useForm()
  const { robotId } = useParams()
  const [modal, contextHolder] = Modal.useModal()
  const CreativityData = useAppSelector((state) => state.creativitySlice)
  // 当前选中的分类详情
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
    navigate('/marketingCreativity')
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
  const restParams = () => {
    setIsInit(true)
    setConversitionList([])
    setLoading(false)
    currentConversation = {
      conversationId: '',
      chatId: 0
    }
    if (CreativityData && CreativityData.currentCategory && form) {
      setTimeout(() => {
        form.resetFields()
      }, 0)
    }
  }
  // 各分类list 点击
  const getItemDetail = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number, type: string) => {
    e.stopPropagation()
    if (id === Number(robotId)) return
    navigate(`/marketingCreativity/${id}`, {
      state: {
        type
      }
    })
    dispatch(
      updateCollapsed({
        key: type,
        collapsed: true,
        closeOthers: true
      })
    )
    restParams()
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
        const matchedItem = CreativityData.currentCategory && CreativityData.currentCategory.list.find((item) => item.input_name === key)
        // 如果找到了匹配的项，就使用这一项的 default 值
        if (matchedItem) {
          form.setFieldsValue({
            [key]: matchedItem.default
          })
        }
      }
    }
    setLoading(true)
    if (isInit) {
      // 创建一个新的会话
      const { payload } = (await dispatch(
        startChat({
          menu: currentMenuKey,
          prompt: '',
          promptId: CreativityData.currentCategory.id
        })
      )) as { payload: ShartChatResp }
      currentConversation = payload
      console.log('是新会话,创建一个新会话 ID为:', payload)
      console.log(currentConversation, '更新questionId为新会话id')
      setIsInit(false)
    }
    let uuid = UUID()
    setCurrentUUID(uuid)
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
            menu: 9,
            query: '',
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
              dispatch(getHistoryList())
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
            query: '',
            inputs: transformObject(form.getFieldsValue())
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
          setConversitionList((prev) => {
            return prev?.map((item) => {
              if (item.UUID === uuid) {
                return {
                  ...item,
                  content: '出错了',
                  isLoading: false
                }
              }
              return item
            }) as MessageInfo[]
          })
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
  const customRequest = async (options: UploadRequestOption, item: CategoryDetailList) => {
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
  useMount(() => {
    const state = location.state
    if (CreativityData.category.length === 0) {
      dispatch(getMarketingCategoryList())
      dispatch(getCategoryDetail(Number(robotId)))
    }
    if (CreativityData.wish.list.length === 0) {
      dispatch(getWishList())
    }
    if (CreativityData.history.list.length === 0) {
      dispatch(getHistoryList())
    }
    if (!state) return
    const { type } = state
    if (!type) return
    dispatch(
      updateCollapsed({
        key: type,
        collapsed: true,
        closeOthers: true
      })
    )
  })

  useUpdateEffect(() => {
    if (!robotId) return
    const getData = async () => {
      await dispatch(initCurrentCategory())
      await dispatch(getCategoryDetail(Number(robotId)))
    }
    getData()
  }, [robotId])
  useUnmount(() => {
    dispatch(initCurrentCategory())
    restParams()
  })
  return (
    <div className="w-full h-full">
      {contextHolder}
      <div className="w-full text-[#1a2029] bg-white p-2 border-b-[1px] border-[rgba(0,0,0,0.1)]">
        <p className="text-28 font-600 *:leading-7">AI 营销创意助手</p>
        <p className="font-400 text-14 mt-3 line-clamp-1">根据企业需求，生成各种营销创意，如广告语、海报设计、视频脚本以及全面的营销方案策划，包括线上线下活动、社交媒体推广等。帮助企业实现营销活动的自动化，提高营销效率，降低人力成本。</p>
      </div>
      <div className="w-full h-[calc(100vh-91px)] bg-[#F3F5F8] flex items-center justify-center overflow-hidden">
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
            {CreativityData && CreativityData.category && CreativityData.history && CreativityData.history.list && CreativityData.category.length > 0 && CreativityData.history.list.length > 0 && (
              <div onClick={() => dispatch(updateCollapsed({ key: CreativityData.history.title, collapsed: !CreativityData.history.isExpanded }))} className={`w-full overflow-hidden rounded-[4px] bg-[#fff] cursor-pointer ${CreativityData.history.isExpanded ? 'h-auto' : ' h-10'}`}>
                <div className="flex items-center h-[40px] bg-[#fff] pl-3 pr-[6px] py-[10px]">
                  <div
                    className="bg-contain bg-center bg-no-repeat relative w-[20px] h-[20px] rounded-[2px] mx-[8px]"
                    style={{
                      backgroundImage: `url(${CreativityData.history.icon_small})`
                    }}
                  />
                  <div className="flex-grow text-14 text-[#222]">{CreativityData.history.title}</div>
                  <i className={`iconfont ${CreativityData.history.isExpanded ? 'icon-shang' : 'icon-xia'} w-[20px] h-[20px] transform !text-10`} />
                </div>
                {CreativityData.history.list.map((item, index) => {
                  return (
                    <div onClick={(e) => getItemDetail(e, item.id, 'history')} key={index} className={`w-[184px] h-8 my-1 flex items-center group relative mx-2 pl-8 rounded-4px hover:bg-[rgba(243,245,248,0.5)] ${Number(robotId) === item.id ? '!bg-[#F3F5F8] font-bold' : ''}`}>
                      <img alt="" className="w-[20px] h-[20px] rounded-[4px]" src={item.icon} />
                      <span className="text-14 text-[#222] leading-[20px] h-[20px] ml-3 truncate">{item.nickname}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {/* 收藏 */}
            {CreativityData && CreativityData.category && CreativityData.wish && CreativityData.wish.list && CreativityData.category.length > 0 && CreativityData.wish.list.length > 0 && (
              <div onClick={() => dispatch(updateCollapsed({ key: CreativityData.wish.title, collapsed: !CreativityData.wish.isExpanded }))} className={`w-full overflow-hidden rounded-[4px] bg-[#fff] cursor-pointer ${CreativityData.wish.isExpanded ? 'h-auto' : ' h-10'}`}>
                <div className="flex items-center h-[40px] bg-[#fff] pl-3 pr-[6px] py-[10px]">
                  <div
                    className="bg-contain bg-center bg-no-repeat relative w-[20px] h-[20px] rounded-[2px] mx-[8px]"
                    style={{
                      backgroundImage: `url(${CreativityData.wish.icon_small})`
                    }}
                  />
                  <div className="flex-grow text-14 text-[#222]">{CreativityData.wish.title}</div>
                  <i className={`iconfont ${CreativityData.wish.isExpanded ? 'icon-shang' : 'icon-xia'} w-[20px] h-[20px] transform !text-10`} />
                </div>
                {CreativityData.wish.list.map((item, index) => {
                  return (
                    <div onClick={(e) => getItemDetail(e, item.id, 'wish')} key={index} className={`w-[184px] h-8 my-1 flex items-center group relative mx-2 pl-8 rounded-4px hover:bg-[rgba(243,245,248,0.5)] ${Number(robotId) === item.id ? '!bg-[#F3F5F8] font-bold' : ''}`}>
                      <img alt="" className="w-[20px] h-[20px] rounded-[4px]" src={item.icon} />
                      <span className="text-14 text-[#222] leading-[20px] h-[20px] ml-3 truncate">{item.nickname}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {/* 所有分类 */}
            {CreativityData && CreativityData.category && CreativityData.category.length > 0 ? (
              CreativityData.category.map((item) => {
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
                    {item.list.map((list, index) => {
                      return (
                        <div onClick={(e) => getItemDetail(e, list.id, item.title)} key={index} className={`w-[184px] h-8 my-1 flex items-center group relative mx-2 pl-8 rounded-4px hover:bg-[rgba(243,245,248,0.5)] ${Number(robotId) === list.id ? '!bg-[#F3F5F8] font-bold' : ''}`}>
                          <img alt="" className="w-[20px] h-[20px] rounded-[4px]" src={list.icon} />
                          <span className="text-14 text-[#222] leading-[20px] h-[20px] ml-3 truncate">{list.nickname}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            ) : (
              <div className="w-full h-full flex justify-center items-center opacity-30">
                <Loading />
              </div>
            )}
          </div>
        </div>
        {/*  内容 */}
        <div className="w-full h-full bg-[#F3F5F8] flex items-center justify-center overflow-hidden">
          {/*  详情页 表单 */}
          {CreativityData && (
            <div className="flex flex-col w-1/3 flex-grow h-full bg-[#fff]">
              {CreativityData.category && CreativityData.category.length > 0 && Object.keys(CreativityData.currentCategory).length > 0 ? (
                <div className="w-full h-full flex flex-col justify-center items-center pb-6">
                  {/* 头部 */}
                  <header className="flex items-center w-full h-[72px] pl-4 border-b-[1px] border-[rgba(0,0,0,0.1)] cursor-pointer">
                    <img alt="" className="w-7 h-7 rounded-[6px] mx-[10px]" src={CreativityData.currentCategory.icon} />
                    <div className="text-20 font-medium line-clamp-2" title={CreativityData.currentCategory.description}>
                      {CreativityData.currentCategory.nickname}
                    </div>
                  </header>
                  {/* 表单 */}
                  <div className="w-full px-6 pt-6 h-0 flex-grow overflow-y-scroll nw-scrollbar mr-[2px]">
                    <Form autoComplete="off" layout="vertical" form={form}>
                      {CreativityData &&
                        CreativityData.currentCategory &&
                        CreativityData.currentCategory.list &&
                        CreativityData.currentCategory.list.length > 0 &&
                        CreativityData.currentCategory.list.map((item) => {
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
              ) : (
                <div className="w-full h-full flex justify-center items-center opacity-30">
                  <Loading />
                </div>
              )}
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
                  conversitionList.map((item, index) => {
                    return (
                      <div key={index} className="flex flex-col mb-4">
                        <div className="flex-1 bg-[#fff] flex flex-col text-[#222] text-15 leading-[22px] px-6 py-4">
                          <div
                            className="markdown-body text-15 leading-[26px]"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(
                                item.isLoading ? '<span class="loading loading-dots loading-xs"></span>' : item.content.endsWith('```') || item.content.match(/\B```\b[a-zA-Z]+\b(?!\s)/) ? item.content : item.content + `${currentUUID === item.UUID ? '<span class="gpt-cursor"></span>' : ''}`
                              )
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
                <FloatButton.BackTop
                  style={{
                    right: 30
                  }}
                  tooltip="回到顶部"
                  className="hover:opacity-80"
                  visibilityHeight={200}
                  target={() => document.querySelector('#prompt-content-wrap') as HTMLDivElement}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreativityDetail
