import React, { MutableRefObject, useRef, useState } from 'react'
import './index.css'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import Toast from '../toast'
import { Tooltip } from 'antd'

/**
 * @description: history 历史记录组件
 * @param {String} className 样式类
 * @param {JSX.Element} title_Icon 是否需要标题左侧图标
 * @param {string} title 标题
 * @param {React.ReactNode} item_Icon 历史记录item 标题左侧图标
 * @return {*}
 */

type Props = {
  className?: string
  title_Icon?: boolean
  title?: string
  history_list?: []
  item_Icon?: React.ReactNode
  rest?: any
}

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

export default function History({ className, title = '对话', title_Icon = false, item_Icon, history_list, ...rest }: Props) {
  const [historyCollapsed, setHistoryCollapsed] = useState(false)
  const [historyList, setHistoryList] = useState(arr)
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  const [currentId, setCurrentId] = useState('')
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
        message: '已经是最新' + title
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
  return (
    <>
      <div className={`history ${className}`} ref={historyDivRef}>
        <div className="histroy-header">
          <div className="left-header-block-up">
            <p className="text">历史记录</p>
            <div className="fold">
              <Tooltip className="cursor-pointer" placement="right" title={'收起历史记录'}>
                <i className="iconfont icon-zhedie" onClick={() => toggleHistory(true)}></i>
              </Tooltip>
            </div>
          </div>
          <div className="new-session-button-wrap" onClick={() => createNewConversation()}>
            <div className="new-session-button">
              <span>
                {title_Icon && <img src={newSessionIcon} alt="" />} 新建{title}
              </span>
            </div>
          </div>
        </div>
        <div className="history-list">
          <div>
            {historyList &&
              historyList.map((item, index) => {
                return (
                  <div onClick={() => getHistoryList(item.id)} className={`history-item ${currentId === item.id ? 'active' : ''}`} key={index}>
                    <div className="title">
                      {item_Icon}
                      {item.title}
                    </div>
                    <div className="time">
                      <span>{item.time}</span> <i style={{ display: 'none' }} className="iconfont icon-shanchu" onClick={() => delHistoryItem(item.id)}></i>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
      {historyCollapsed && (
        <div className="expand-bar">
          <Tooltip placement="right" title={'新建' + title}>
            <div className="add-session-icon" onClick={() => createNewConversation()}></div>
          </Tooltip>
          <Tooltip placement="right" title={'展开历史记录'}>
            <div className="expand-icon" onClick={() => toggleHistory(false)}></div>
          </Tooltip>
        </div>
      )}
    </>
  )
}
