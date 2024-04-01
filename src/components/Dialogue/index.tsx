import React, { useRef, useState } from 'react'
import defaultAvatar from '@/assets/images/default-avatar.jpg'
import rebotAvatar from '@/assets/images/robot.svg'
import { useAppDispatch } from '@/store/hooks'
import Search from '../Search'
import './index.css'
// 定义一个文件信息的类型
type FileInfo = {
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
type Props = {
  isNewChat: boolean
  conversitionDetailList: any[]
}

export default function Dialogue({ isNewChat, conversitionDetailList }: Props) {
  // 初始化问题Id
  // let questionId = currentId || Date.now()
  // const location = useLocation()
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
  // 初始化文件列表
  const [fileList, setFileList] = useState([] as FileInfo[])

  return (
    <div className="dialogue-detail">
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
                      <div className="chat-bubble ">{item.content}</div>
                    </div>
                  )}
                  {item.type === 1 && (
                    <div className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img alt="Tailwind CSS chat bubble component" src={rebotAvatar} />
                        </div>
                      </div>
                      <div className="chat-bubble">{item.content}</div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
        {/* <div className="last-div"></div> */}
      </div>
      <Search fileList={[]} sendMessage={() => {}} sendValue="" setFileList={() => {}} setSendValue={() => {}} uploadHandle={() => {}} enterMessage={() => {}} messageLoading={false} />
    </div>
  )
}
