import React, { MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react'
import './index.css'
import newSessionIcon from '@/assets/images/new_session_icon.svg'
import Toast from '../Toast'
import { Skeleton, Tooltip } from 'antd'
import { menuType, menuWarp } from '@/utils/constants'
import { useLocation } from 'react-router-dom'
import chatAPi from '@/api/chat/index'
import { HistoryList, MessageInfo } from '@/store/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getHistoryList, delHistoryItem, getConversitionDetail } from '@/store/action/talkActions'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { clearConversitionDetailList, clearHistoryList, initState, talkInitialState, toggleIsNewChat, updateCurrentId, updateLoading } from '@/store/reducers/talk'
import { debounce } from 'radash'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loading from '@/pages/Loading'

/**
 * @description: history 历史记录组件
 * @param {String} className 样式类
 * @param {JSX.Element} title_Icon 是否需要标题左侧图标
 * @param {string} title 标题
 * @param {React.ReactNode} item_Icon 历史记录item 标题左侧图标
 * @param {boolean} isNewConversation 是否是新对话
 * @param {(arg0:boolean)=>any} setIsNewConversation 控制是否是新对话
 * @param {}
 * @return {*}
 */

type Props = {
  className?: string
  title_Icon?: boolean
  title?: string
  history_list?: HistoryList
  item_Icon?: React.ReactNode
  rest?: any
} & Partial<talkInitialState>

const History = ({ className = '', title = '对话', title_Icon = false, item_Icon, history_list, isNewChat, historyList, currentId, ...rest }: Props) => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  // 记录历史折叠状态
  const [historyCollapsed, setHistoryCollapsed] = useState(false)
  // 创建历史折叠按钮的ref
  const historyDivRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>
  // 记录当前菜单的key
  const currentMenuKey = useRef<menuType>(0)

  // 记住当前loading状态 未结束不许加载
  const [isLoading, setIsLoading] = useState(false)
  // 切换历史折叠状态
  const toggleHistory = (flag: Boolean) => {
    if (flag) {
      historyDivRef.current.style.display = 'none'
    } else {
      historyDivRef.current.style.display = ''
    }
    setHistoryCollapsed(!historyCollapsed)
  }
  // 创建新的会话
  const createNewConversation = () => {
    if (isNewChat) {
      return Toast.notify({
        type: 'info',
        message: '已经是最新' + title
      })
    }
    // 置空
    dispatch(updateCurrentId(''))
    // 清空历史记录
    dispatch(clearConversitionDetailList())
    dispatch(toggleIsNewChat(true))
  }

  // 删除历史记录某条
  const delHistory = async (id: string) => {
    if (!id) return
    // loading
    dispatch(updateLoading(true))
    // 删除历史记录
    const isdelete = await dispatch(delHistoryItem(id))
    if (!isdelete) return dispatch(updateLoading(false))
    dispatch(toggleIsNewChat(true))
    // 删除成功
    Toast.notify({ type: 'success', message: '删除成功' })
    // 关闭loading
    dispatch(updateLoading(false))
  }
  // 获取
  const getConversationList = async (id: string) => {
    // 如果当前id 等于传过来的id 直接return
    if (currentId === id) return
    dispatch(toggleIsNewChat!(false))
    // 切换当前会话id
    dispatch(updateCurrentId(id))
    // loading
    dispatch(updateLoading(true))
    // 清空之前的会话详情
    dispatch(clearConversitionDetailList())
    // 获取会话详情
    await dispatch(getConversitionDetail(id))
    // 关闭 loading
    dispatch(updateLoading(false))
  }
  useEffect(() => {
    const pathname = location.pathname
    currentMenuKey.current = menuWarp[pathname] as menuType
    dispatch(initState())
    console.log('当前menu:', menuWarp[pathname])
  }, [dispatch, location.pathname])

  const loadMore = (page?: number) => {
    if (!historyList) return
    dispatch(
      getHistoryList({
        menu: currentMenuKey.current,
        page: page ? page : historyList.pageIndex + 1,
        pageSize: 10
      })
    )
  }
  useEffect(() => {
    loadMore(1)
    dispatch(clearHistoryList())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyList?.empty])

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
        <div className="history-list animate__animated animate__fadeInUp animate__faster" id="scrollableDiv">
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
                  <div onClick={() => getConversationList(item.id)} className={`history-item ${currentId === item.id ? 'active' : ''}`} key={index}>
                    <div className="title">
                      {item_Icon}
                      {item.title}
                    </div>
                    <div className="time">
                      <span>{item.createTime.replace('T', '  ')}</span> <i style={{ display: 'none' }} className="iconfont icon-shanchu" onClick={() => delHistory(item.id)}></i>
                    </div>
                  </div>
                )
              })}
            </InfiniteScroll>
          )}
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

// mapStateToProps 函数：将 state 映射到 props
function mapStateToProps(state: RootState) {
  return state.talkSlice
}

// mapDispatchToProps 函数：将 dispatch 映射到 props
function mapDispatchToProps(dispatch: AppDispatch) {
  return {}
}

// 使用 connect 连接组件和 Redux store
const ConnectedHistory = connect(mapStateToProps, mapDispatchToProps)(History)

export default ConnectedHistory
