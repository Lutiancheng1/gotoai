import { ConfigProvider, Menu, MenuProps, Popover, Tooltip, Layout, Modal, FloatButton } from 'antd'
import { Route, Routes, useLocation } from 'react-router-dom'
import Sider from 'antd/es/layout/Sider'
import React, { Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuItemType } from 'antd/es/menu/hooks/useItems'
import { menuConfig } from '@/utils/constants'
import logo from '@/assets/images/logo.png'
import './index.css'
import { getAccountInfo, removeDifyInfo } from '@/utils/storage'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logOut } from '@/store/reducers/login'
import { getUserProfile } from '@/store/action/profileActions'
import { AppDispatch, RootState } from '@/store'
import { connect } from 'react-redux'
import { talkInitialState } from '@/store/reducers/talk'
import GlobalLoading from '@/components/loading'
import exitIcon from '@/assets/images/exit.svg'
import blogIcon from '@/assets/images/blog.svg'
import reportIcon from '@/assets/images/report.svg'
import collectIcon from '@/assets/images/collect.svg'
import userImg from '@/assets/images/user.jpeg'
import { desensitizePhone } from '@/utils'
import Dialogue from '@/components/Dialogue'
import Robot from '@/pages/Robot'
// 导入子路由
const NotFound = React.lazy(() => import('@/pages/NotFound'))
const Home = React.lazy(() => import('@/pages/Talk'))
const Loading = React.lazy(() => import('@/pages/Loading'))
const Document = React.lazy(() => import('@/pages/Document'))
const Code = React.lazy(() => import('@/pages/Code'))
const KnowledgeBase = React.lazy(() => import('@/pages/KnowledgeBase'))
const DataAnalysis = React.lazy(() => import('@/pages/DataAnalysis'))
const DrawDesigns = React.lazy(() => import('@/pages/DrawDesigns'))
const Video = React.lazy(() => import('@/pages/Video'))
const Application = React.lazy(() => import('@/pages/Application'))
type Props = {} & Partial<talkInitialState>
const Index = ({ loading }: Props) => {
  const [categoryCollapsed, setCategoryCollapsed] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const navagate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.profileSlice.user)
  // 聊天机器人是否折叠展开
  const [isRobotCollapsed, setIsRobotCollapsed] = useState(false)
  const categoryItems: MenuItemType[] = menuConfig.map((item) => {
    return {
      key: item.key,
      icon: <i className={`iconfont ${item.icon}`}></i>,
      label: item.label,
      disabled: item.disabled
    }
  })

  const menuGo: MenuProps['onClick'] = async ({ key }) => {
    navagate(`/${key}`)
  }
  const logout = () => {
    setIsLogoutModalVisible(true)
  }
  const handleLogoutConfirm = async () => {
    dispatch(logOut())
    removeDifyInfo()
    navagate('/login', { replace: true })
  }
  useEffect(() => {
    setCurrentPath(location.pathname.substr(1))
  }, [location])
  useEffect(() => {
    dispatch(getUserProfile(getAccountInfo().username))
  }, [dispatch])

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
        <div className="home layout">
          <Modal title="提示" width={300} open={isLogoutModalVisible} onOk={handleLogoutConfirm} onCancel={() => setIsLogoutModalVisible(false)} centered okText="确认" cancelText="取消" okType="primary" maskClosable>
            确定退出登录吗?
          </Modal>
          <Sider
            trigger={
              <div className="logout">
                <Popover
                  overlayInnerStyle={{ padding: 0, borderRadius: 16 }}
                  className="user-popover"
                  arrow={false}
                  content={
                    <div className="my-popper" role="tooltip" onClick={(e) => e.stopPropagation()}>
                      <div className="panda-tooltip panda-tooltip-isNoBeta">
                        <div className="head">
                          <div className="head-icon">
                            <img alt="" src={userImg} />
                            <div className="updateAvatar">
                              <div className="innerIcon" />
                            </div>
                            <p className="head-icon-logo head-icon-logo-isNoBeta" />
                            <input
                              accept=".jpg,.jpeg,.png,.bmp,.tif,.tiff,.webp,.svg"
                              style={{
                                display: 'none'
                              }}
                              type="file"
                            />
                          </div>
                          <div className="head-info">
                            <div className="head-name">
                              <p className="dot name">用户_{user.username}</p>
                              <div className="icon-box">
                                {/* <div className="edit" /> */}
                                <Tooltip placement="top" title={desensitizePhone(user && user.phone)}>
                                  <div className="phone" />
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="actions">
                          <div className="action flex flex-x-between">
                            <div className="flex flex-x-between flex-y-center">
                              <p
                                className="action-icon"
                                style={{
                                  backgroundImage: `url(${collectIcon})`
                                }}
                              />
                              <p className="action-text">我的收藏</p>
                            </div>
                          </div>
                          <Tooltip placement="top" title={'发至邮箱：feedback@gotoai.world'}>
                            <div className="action flex flex-x-between">
                              <div className="flex flex-x-between flex-y-center" onClick={() => window.open('mailto:feedback@gotoai.world?subject=意见反馈')}>
                                <p
                                  className="action-icon"
                                  style={{
                                    backgroundImage: `url(${reportIcon})`
                                  }}
                                />
                                <p className="action-text">意见反馈</p>
                              </div>
                            </div>
                          </Tooltip>
                          <div className="action flex flex-x-between" onClick={() => window.open('https://www.gotoai.world/h-col-126.html')}>
                            <div className="flex flex-x-between flex-y-center">
                              <p
                                className="action-icon"
                                style={{
                                  backgroundImage: `url(${blogIcon})`
                                }}
                              />
                              <p className="action-text">关于我们</p>
                            </div>
                          </div>
                          <div className="action flex flex-x-between" onClick={() => logout()}>
                            <div className="flex flex-x-between flex-y-center">
                              <p
                                className="action-icon"
                                style={{
                                  backgroundImage: `url(${exitIcon})`
                                }}
                              />
                              <p className="action-text">退出登录</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="popper__arrow"
                        style={{
                          left: '38px'
                        }}
                        x-arrow=""
                      />
                    </div>
                  }
                >
                  <i onClick={(e) => e.stopPropagation()} style={{ fontSize: categoryCollapsed ? 20 : 30, marginRight: categoryCollapsed ? 10 : 20 }} className="iconfont icon-user cursor-pointer"></i>
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
            style={{ borderInlineEnd: '1px solid rgba(5, 5, 5, 0.06)', position: 'relative', zIndex: 99 }}
            width={160}
            collapsible
            collapsed={categoryCollapsed}
            onCollapse={(value) => setCategoryCollapsed(value)}
          >
            <div className="category">
              <div className="logo h-10">
                <img src={logo} alt="" style={{ height: categoryCollapsed ? 25 : 40 }} />
              </div>
              <section className="my-menu">{currentPath && <Menu theme="light" onClick={(e) => menuGo(e)} className="h-full text-sm w-34" mode="inline" defaultSelectedKeys={[currentPath]} items={categoryItems} />}</section>
            </div>
          </Sider>
          {/* 右侧需要变化的区域 */}
          <div className="home-content w-full h-full relative">
            {loading && (
              <div id="mask" className="w-full h-full opacity-30" style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}>
                <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                  <GlobalLoading></GlobalLoading>
                </div>
              </div>
            )}
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/talk" element={<Home />} />
                <Route path="/document" element={<Document />} />
                <Route path="/code" element={<Code />} />
                <Route path="/knowledgeBase" element={<KnowledgeBase />} />
                <Route path="/dataAnalysis" element={<DataAnalysis />} />
                <Route path="/drawDesigns" element={<DrawDesigns />} />
                <Route path="/video" element={<Video />} />
                <Route path="/application" element={<Application />} />
                <Route path="/*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          {/* 客服机器人 */}
          <FloatButton
            type={isRobotCollapsed ? 'primary' : 'default'}
            style={{
              bottom: 180
            }}
            icon={isRobotCollapsed ? <i className="iconfont icon-x"></i> : <i className="iconfont icon-kefu"></i>}
            tooltip={<span>GotoAI 智能客服</span>}
            onClick={() => {
              setIsRobotCollapsed(!isRobotCollapsed)
            }}
          />
          <Robot
            style={{
              display: isRobotCollapsed ? '' : 'none'
            }}
          />
        </div>
      </Layout>
    </ConfigProvider>
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
const ConnectedIndex = connect(mapStateToProps, mapDispatchToProps)(Index)

export default ConnectedIndex
