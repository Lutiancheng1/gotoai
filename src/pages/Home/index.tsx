import React, { MutableRefObject, ReactNode, useRef, useState } from 'react'
import { Layout, Menu, Button, theme, ConfigProvider, Slider, Tabs, Tooltip, MenuProps, Popover } from 'antd'
import dayjs from 'dayjs'
import './index.css'
import { MenuItemType } from 'antd/es/menu/hooks/useItems'
import { Footer } from 'antd/es/layout/layout'
import TextArea from 'antd/es/input/TextArea'
import logo from '@/assets/images/logo.png'
import sendIcon from '@/assets/images/send.svg'
import initLogo from '@/assets/images/test-logo.png'
import { menuConfig, promptConfig } from '@/utils/constants'
import openai, { OPENAI_MODEL } from '@/utils/openAi'
import axios from 'axios'
import { http, request, ssePost } from '@/utils/request'
import Toast from '@/components/toast'
import { useNavigate } from 'react-router-dom'
const { Header, Sider, Content } = Layout

const categoryItems: MenuItemType[] = menuConfig.map((item) => {
  return {
    key: item.key,
    icon: <i className={`iconfont ${item.icon}`}></i>,
    label: item.label
  }
})
let arr = [
  {
    id: '1',
    title: ' sdadadas',
    time: '2024-03-19 17:35:35'
  },
  {
    id: '2',
    title: ' sdadadas',
    time: '2024-03-19 17:35:35'
  },
  {
    id: '3',
    title: ' sdadadas',
    time: '2024-03-19 17:35:35'
  }
] as arrT[]
type arrT = { id: String; title: String; time: String }

const Index: React.FC = () => {
  const [categoryCollapsed, setCategoryCollapsed] = useState(false)
  const [historyCollapsed, setHistoryCollapsed] = useState(false)
  const [historyList, setHistoryList] = useState(arr)
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  const [currentId, setCurrentId] = useState(arr[0].id)
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
  const navagate = useNavigate()
  const toggleHistory = (flag: Boolean) => {
    if (flag) {
      historyDivRef.current.style.display = 'none'
    } else {
      historyDivRef.current.style.display = ''
    }
    setHistoryCollapsed(!historyCollapsed)
  }
  const delHistoryItem = (id: String) => {
    const resultList = historyList.filter((item) => item.id !== id)
    setHistoryList(resultList)
    setIsNewConversation(true)
    console.log(id, resultList)
  }
  const getHistoryList = (id: String) => {
    setCurrentId(id)
    setIsNewConversation(false)
    setConversitionDetailList([])
  }
  const sendMessage = async () => {
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
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: sendValue }],
      model: OPENAI_MODEL,
      temperature: 0.6
      // stream: true
    })
    // for await (const chunk of completion) {
    //   console.log(chunk.choices[0].delta.content)
    //   let resultText = (chunk.choices[0].delta.content += respText)
    //   console.log(resultText)

    //   setRespText(resultText)
    // }
    setRespText(completion.choices[0].message.content as string)
    console.log(completion.choices[0].message.content)

    setSendValue('')
    setLoading(false)
  }
  const menuGo: MenuProps['onClick'] = ({ key }) => {
    console.log(key)
    navagate(`/${key}`)
  }
  const logout = () => {
    navagate('/login', { replace: true })
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
          <Sider
            trigger={
              <div className="logout">
                <Popover
                  content={
                    <button className="btn" onClick={() => logout()}>
                      logout
                    </button>
                  }
                >
                  <i onClick={(e) => e.stopPropagation()} style={{ fontSize: categoryCollapsed ? 20 : 30, marginRight: categoryCollapsed ? 10 : 20 }} className="iconfont icon-user"></i>
                </Popover>
                {!categoryCollapsed ? (
                  <Tooltip placement="right" title={'收起'}>
                    <i className="iconfont icon-zhedie"></i>
                  </Tooltip>
                ) : (
                  <Tooltip placement="right" title={'展开'}>
                    <i style={{ fontSize: 10 }} className="iconfont icon-zhankai"></i>
                  </Tooltip>
                )}
              </div>
            }
            style={{ borderInlineEnd: '1px solid rgba(5, 5, 5, 0.06)' }}
            width={160}
            collapsible
            collapsed={categoryCollapsed}
            onCollapse={(value) => setCategoryCollapsed(value)}
          >
            <div className="category">
              <div className="logo h-10">
                <img src={logo} alt="" style={{ height: categoryCollapsed ? 25 : 40 }} />
              </div>
              <section className="my-menu">
                <Menu theme="light" onClick={(e) => menuGo(e)} className="h-full text-sm w-34" mode="inline" defaultSelectedKeys={['talk']} items={categoryItems} />
              </section>
            </div>
          </Sider>
          <div className="history" ref={historyDivRef}>
            <div className="histroy-header">
              <div className="left-header-block-up">
                <p className="text">历史记录</p>
                <div>
                  <Tooltip className="cursor-pointer" placement="right" title={'收起历史记录'}>
                    <i className="iconfont icon-zhedie" onClick={() => toggleHistory(true)}></i>
                  </Tooltip>
                </div>
              </div>
              <div className="new-session-button-wrap" onClick={() => setIsNewConversation(true)}>
                <div className="new-session-button">
                  <span> 新建对话</span>
                </div>
              </div>
            </div>
            <div className="history-list">
              {historyList &&
                historyList.map((item, index) => {
                  return (
                    <div onClick={() => getHistoryList(item.id)} className={`history-item ${currentId === item.id ? 'active' : ''}`} key={index}>
                      <div className="title">{item.title}</div>
                      <div className="time">
                        <span>{item.time}</span> <i className="iconfont icon-shanchu" onClick={() => delHistoryItem(item.id)}></i>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
          {historyCollapsed && (
            <div className="expand-bar">
              <Tooltip placement="right" title={'新建对话'}>
                <div className="add-session-icon" onClick={() => setIsNewConversation(true)}></div>
              </Tooltip>
              <Tooltip placement="right" title={'展开历史记录'}>
                <div className="expand-icon" onClick={() => toggleHistory(false)}></div>
              </Tooltip>
            </div>
          )}
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
                              <img alt="Tailwind CSS chat bubble component" src="https://demo.gotoai.world/_next/static/media/default-avatar.bda71a7e.jpg" />
                            </div>
                          </div>
                          <div className="chat-bubble ">{item.query}</div>
                        </div>
                        <div className="chat chat-start">
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img alt="Tailwind CSS chat bubble component" src="https://demo.gotoai.world/_next/static/media/robot.eec9592e.svg" />
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
              <div className="last-div"></div>
            </div>
            <div className="search-box animate__bounceInUp">
              <div className="search-container">
                <div className="search flex">
                  <div className="search-input-box">
                    <div className="input-wrap">
                      <div className="input-box-inner">
                        <TextArea wrap="off" value={sendValue} onPressEnter={() => sendMessage()} onChange={(e) => setSendValue(e.target.value)} placeholder="输入你的问题或需求" autoSize={{ minRows: 1, maxRows: 9 }} />
                      </div>
                      <div className="search-interactive">
                        <div className="upload-image-wrap">
                          <Tooltip title={'上传图片'}>
                            <div className="upload-image-btn" onClick={() => {}}></div>
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
export default Index
