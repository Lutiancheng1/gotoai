import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { Layout, ConfigProvider, Tooltip } from 'antd'
import dayjs from 'dayjs'
import './index.css'
import TextArea from 'antd/es/input/TextArea'
import { promptConfig } from '@/utils/constants'
import Toast from '@/components/toast'
import axios from 'axios'
import { sendMessageToAi } from '@/api/openai'
import { parsePack } from '@/utils/format'
import sendIcon from '@/assets/images/send.svg'
import initLogo from '@/assets/images/test-logo.png'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'

import newSessionIcon from '@/assets/images/new_session_icon.svg'
import History from '@/components/history'
let arr = [
  { id: '1', title: 'Sample Title 1', time: '10:00' },
  { id: '2', title: 'Sample Title 2', time: '10:30' },
  { id: '3', title: 'Sample Title 3', time: '11:00' },
  { id: '4', title: 'Sample Title 4', time: '11:30' },
  { id: '5', title: 'Sample Title 5', time: '12:00' },
  { id: '6', title: 'Sample Title 6', time: '12:30' },
  { id: '7', title: 'Sample Title 7', time: '13:00' },
  { id: '8', title: 'Sample Title 8', time: '13:30' },
  { id: '9', title: 'Sample Title 9', time: '14:00' },
  { id: '10', title: 'Sample Title 10', time: '14:30' }
] as arrT[]
type arrT = { id: string; title: string; time: string }
type FileInfo = {
  file_id: string
  file_name: string
  file_size: number | string
  file_url: string
  height: number
  width: number
  type: string
}
const Talk: React.FC = () => {
  const [historyCollapsed, setHistoryCollapsed] = useState(false)
  const [historyList, setHistoryList] = useState(arr)
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  const [currentId, setCurrentId] = useState('')
  const [sendValue, setSendValue] = useState('')
  const [conversitionDetailList, setConversitionDetailList] = useState(
    [] as {
      id: string | number
      answer: string
      conversation_id: string
      created_at: string
      query: string
    }[]
  )
  const [isNewConversation, setIsNewConversation] = useState(true)
  const [loading, setLoading] = useState(false)
  const [respText, setRespText] = useState('')
  const scrollBox = useRef<HTMLDivElement>(null)
  const innerBox = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [fileList, setFileList] = useState([] as FileInfo[])
  const toggleHistory = (flag: Boolean) => {
    if (flag) {
      historyDivRef.current.style.display = 'none'
    } else {
      historyDivRef.current.style.display = ''
    }
    setHistoryCollapsed(!historyCollapsed)
  }
  const createNewConversation = () => {
    if (isNewConversation) {
      return Toast.notify({
        type: 'info',
        message: '已经是最新对话'
      })
    }
    setIsNewConversation(true)
    setCurrentId('')
  }
  const delHistoryItem = (id: string) => {
    const resultList = historyList.filter((item) => item.id !== id)
    setHistoryList(resultList)
    setIsNewConversation(true)
    console.log(id, resultList)
  }
  const getHistoryList = (id: string) => {
    setCurrentId(id)
    setIsNewConversation(false)
    setConversitionDetailList([])
  }
  const sendMessage = async () => {
    let finish = false
    scrollBox.current!.scrollTo(0, 10000000000)
    setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
    if (!sendValue && !sendValue.trim()) {
      return Toast.notify({ type: 'info', message: '请输入内容' })
    }

    setIsNewConversation(false)
    setConversitionDetailList([
      ...conversitionDetailList,
      {
        id: Date.now(),
        conversation_id: Date.now().toString(),
        answer: respText,
        query: sendValue,
        created_at: dayjs(Date.now()).format()
      }
    ])
    setLoading(true)
    const res = await sendMessageToAi([
      {
        role: 'user',
        content: sendValue
      }
    ])
    setSendValue('')
    if (!res.body) return
    const reader = res.body.getReader()
    const decoder: TextDecoder = new TextDecoder()
    let msgText = ''
    while (!finish) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      const jsonArray = parsePack(decoder.decode(value))
      // eslint-disable-next-line no-loop-func
      jsonArray.forEach((json: any) => {
        if (!json.choices || json.choices.length === 0) {
          return
        }
        const text = json.choices[0].delta.content
        if (text) {
          msgText = msgText + text
        }
      })
      setRespText(msgText)
    }
    setLoading(false)
  }
  const enterMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13) {
      if (!sendValue.trim()) {
        setSendValue(sendValue.replace(/\r/gi, '').replace(/\n/gi, ''))
        return Toast.notify({ type: 'info', message: '请输入内容' })
      } else {
        sendMessage()
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
        <div className="home">
          <History />
          <div className="detail">
            <div className="session-box animate__animated" ref={scrollBox}>
              <div ref={innerBox}>
                {isNewConversation && (
                  <div className="init-page">
                    <div className="warp">
                      <div className="inner">
                        <div className="init-header">
                          <div className="init-logo">
                            <img src={initLogo} alt="" />
                          </div>
                          <div className="init-title">GotoAI 智能助理</div>
                        </div>
                        <div className="init-content">
                          <p>我是您的AI智能助理，初次见面很开心。我可以回答你的各种问题，给你工作，学习上提供帮助，还能随时陪你聊天，立即开始我们的对话吧。</p> <p>&nbsp;</p>
                          <p>您可以试一试以下例子：</p>
                          <p className="cursor-pointer text-blue-500">软件开发专家 请使用联网功能获取相关优秀案例，并为我编写一个自动化邮件回复脚本</p>
                        </div>
                        <div className="init-prompt">
                          <div className="prompt-title">您可以尝试选择以下的预设角色来开始对话。学习如何设计角色和撰写Prompt提示词？请参考我们的网络课堂。</div>
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
                {!isNewConversation &&
                  conversitionDetailList &&
                  conversitionDetailList.map((item, index) => {
                    return (
                      <div className="item" key={index}>
                        <div className="chat chat-end">
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img alt="Tailwind CSS chat bubble component" src={defaultAvatar} />
                            </div>
                          </div>
                          <div className="chat-bubble ">{item.query}</div>
                        </div>
                        <div className="chat chat-start">
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img alt="Tailwind CSS chat bubble component" src={rebotAvatar} />
                            </div>
                          </div>
                          <div className="chat-bubble">
                            <span className={`${loading ? 'loading loading-spinner loading-xs' : ''}`}></span> {respText}
                          </div>
                        </div>
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
                          <div className={`enter ${loading ? 'loading loading-spinner loading-xs' : ''}`} onClick={() => sendMessage()}>
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
export default Talk
