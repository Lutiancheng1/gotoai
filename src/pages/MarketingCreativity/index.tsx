import React, { useState } from 'react'
import './index.css'
import { useMount, useUpdateEffect } from 'ahooks'
import { Category, Wish, History, List } from './types'
import { SearchOutlined } from '@ant-design/icons'
import { ConfigProvider, FloatButton, Input } from 'antd'
import Toast from '@/components/Toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { initialState as initCreativityData, updateCreativityData } from '@/store/reducers/creativity'

type MarketingCreativityProps = {}
const MarketingCreativity: React.FC<MarketingCreativityProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const CreativityData = useAppSelector((state) => state.creativitySlice)
  const [selectedCategory, setSelectedCategory] = useState('')
  //搜索
  const [searchValue, setSearchValue] = useState('')

  const updateCategoryFromHash = () => {
    // 如果URL中有hash值，去掉#，解码，然后保存到状态中
    if (location.hash) {
      const decodedHash = decodeURIComponent(location.hash.substring(1))
      if (decodedHash !== selectedCategory) {
        setSelectedCategory(decodedHash)
      }
    }
  }
  // 收藏 / 取消收藏
  const handleCollect = (item: List, collect: 0 | 1) => {
    let newList
    if (collect === 0) {
      // 添加到收藏列表
      newList = [...CreativityData.wish.list, { ...item, is_wish: 1 as 1 | 0 }]
    } else {
      // 从收藏列表中移除
      newList = CreativityData.wish.list.filter((wishItem) => wishItem.uid !== item.uid)
    }
    // 更新每个category的list列表中对应项的is_wish属性
    const newCategoryList = CreativityData.category.map((category) => {
      return {
        ...category,
        list: category.list.map((categoryItem) => (categoryItem.uid === item.uid ? { ...categoryItem, is_wish: collect === 0 ? 1 : 0 } : categoryItem))
      }
    }) as Category[]
    // 如果history的list数组中有这一项，更新其is_wish属性
    const newHistoryList = CreativityData.history.list.some((historyItem) => historyItem.uid === item.uid)
      ? CreativityData.history.list.map((historyItem) => (historyItem.uid === item.uid ? { ...historyItem, is_wish: (collect === 0 ? 1 : 0) as 1 | 0 } : historyItem))
      : (CreativityData.history.list as List[])

    dispatch(
      updateCreativityData({
        ...CreativityData,
        wish: {
          ...CreativityData.wish,
          list: newList
        },
        category: newCategoryList,
        history: {
          ...CreativityData.history,
          list: newHistoryList
        }
      })
    )
    if (collect === 1) {
      return Toast.notify({ type: 'success', message: '取消收藏成功' })
    }
    Toast.notify({ type: 'success', message: '收藏成功' })
  }
  // 最近使用 删除
  const handleDelete = (item: List) => {
    dispatch(
      updateCreativityData({
        ...CreativityData,
        history: {
          ...CreativityData.history,
          list: CreativityData.history.list.filter((historyItem) => historyItem.uid !== item.uid)
        }
      })
    )
    Toast.notify({ type: 'success', message: '删除成功' })
  }
  // 添加最近使用
  const handleAddHistory = (item: List, type: string) => {
    location.hash = ''
    navigate(`${item.uid}`, {
      state: { type }
    })
    // 如果已经存在
    if (CreativityData.history.list.find((historyItem) => historyItem.uid === item.uid)) return
    dispatch(
      updateCreativityData({
        ...CreativityData,
        history: {
          ...CreativityData.history,
          list: [item, ...CreativityData.history.list]
        }
      })
    )
  }
  // 搜索筛选
  const handleSearch = (value: string) => {
    const normalizedValue = value.normalize()
    setSearchValue(normalizedValue)
    if (normalizedValue.trim() === '') return dispatch(updateCreativityData(initCreativityData))
    // 开始筛选各个list的nickname
    dispatch(
      updateCreativityData({
        history: {} as History,
        wish: {} as Wish,
        category: initCreativityData.category.map((category) => {
          return {
            ...category,
            list: category.list.filter((item) => {
              return item.nickname.normalize().includes(normalizedValue.trim())
            })
          }
        })
      })
    )
  }
  useUpdateEffect(() => {
    updateCategoryFromHash()
  }, [location.hash, selectedCategory]) // 当hash值改变时重新运行这个effect

  useMount(() => {
    updateCategoryFromHash()
  })

  return (
    <div className="w-full h-full">
      <div className="w-full text-[#1a2029] bg-white p-2">
        <p className="text-28 font-600 *:leading-7">AI 营销创意助手</p>
        <p className="font-400 text-14 mt-3 ">根据企业需求，生成各种营销创意，如广告语、海报设计、视频脚本以及全面的营销方案策划，包括线上线下活动、社交媒体推广等。帮助企业实现营销活动的自动化，提高营销效率，降低人力成本。</p>
      </div>
      <div className="marketing-creativity flex pt-5 pl-5 flex-col w-full h-[calc(100vh-112px)] nw-scrollbar bg-[#F3F5F8] overflow-y-auto overflow-hidden">
        <div className="w-full relative">
          {/* 导航条 */}
          <div className="flex justify-center w-full">
            {CreativityData.category.map((item) => {
              const isSelected = selectedCategory === item.title
              return (
                <a key={item.title} className={`flex flex-col items-center w-[68px] h-[70px] mr-[32px] cursor-pointer group ${isSelected ? 'text-[#1F5CFF]' : ''}`} href={`#${item.title}`}>
                  <img alt="" className={`w-8 h-8 block ${isSelected ? '!hidden' : ''} group-hover:hidden`} src={item.icon} />
                  <img alt="" className={`w-8 h-8 hidden ${isSelected ? '!block' : ''} group-hover:block`} src={item.icon_hover} />
                  <span className={`text-13 mt-10px text-[#444] ${isSelected ? 'text-[#1F5CFF]' : ''} group-hover:text-[#1F5CFF] font-semibold`}>{item.title}</span>
                </a>
              )
            })}
          </div>
          {/* 搜索框 */}
          <div className="search-input-wrap">
            <ConfigProvider
              theme={{
                components: {
                  Input: {
                    activeBorderColor: '',
                    hoverBorderColor: ''
                  }
                }
              }}
            >
              <Input
                style={{
                  width: 200,
                  border: 'none',
                  height: 44
                }}
                placeholder="搜索"
                prefix={<SearchOutlined />}
                allowClear
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </ConfigProvider>
          </div>
          {/* 内容list */}
          <div className="flex flex-col flex-wrap mb-5">
            {/* 最近使用 */}
            {CreativityData.history && CreativityData.history.list && CreativityData.history.list.length > 0 && (
              <div className="flex flex-col mt-10" id={CreativityData.history.title}>
                <h2 className="text-20 mt-[10px] flex-nowrap">{CreativityData.history.title}</h2>
                <div className="flex flex-wrap">
                  {CreativityData.history.list.map((list) => {
                    return (
                      <div key={list.uid} title={list.description} onClick={() => handleAddHistory(list, 'history')}>
                        <div className="creative-card flex flex-col relative group w-[216px] h-[116px] mr-[18px] mt-[18px] p-[20px] bg-[#fff] rounded-lg cursor-pointer">
                          <div className="flex absolute right-[10px] top-[8px]">
                            <i
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(list)
                              }}
                              className="w-4 h-4 ml-3 cursor-pointer iconfont icon-shanchu1 text-[#999] hover:text-[#444] hidden group-hover:block"
                            />
                            <i
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCollect(list, list.is_wish)
                              }}
                              className={`w-4 h-4 ml-3 cursor-pointer iconfont ${list.is_wish === 1 ? 'icon-shoucang-active text-[#FFD400]' : 'icon-shoucang text-[#BBB] hover:text-[#444]'}`}
                            />
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg">
                              <img alt="" className=" w-7 h-7 rounded-md" src={list.icon} />
                            </div>
                            <span className="text-16 text-[#222] font-semibold ml-[10px]">{list.nickname}</span>
                          </div>
                          <div className="mt-3 text-[#777] text-12 leading-[17px] overflow-hidden">{list.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {/* 我的收藏 */}
            {CreativityData.wish && CreativityData.wish.list && CreativityData.wish.list.length > 0 && (
              <div className="flex flex-col mt-10" id={CreativityData.wish.title}>
                <h2 className="text-20 mt-[10px] flex-nowrap">{CreativityData.wish.title}</h2>
                <div className="flex flex-wrap">
                  {CreativityData.wish.list.map((list) => {
                    return (
                      <div key={list.uid} title={list.description} onClick={() => handleAddHistory(list, 'wish')}>
                        <div className="creative-card flex flex-col relative group w-[216px] h-[116px] mr-[18px] mt-[18px] p-[20px] bg-[#fff] rounded-lg cursor-pointer">
                          <div className="flex absolute right-[10px] top-[8px]">
                            <i
                              className="w-4 h-4 ml-3 cursor-pointer iconfont icon-shoucang-active text-[#FFD400]"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCollect(list, list.is_wish)
                              }}
                            />
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg">
                              <img alt="" className=" w-7 h-7 rounded-md" src={list.icon} />
                            </div>
                            <span className="text-16 text-[#222] font-semibold ml-[10px]">{list.nickname}</span>
                          </div>
                          <div className="mt-3 text-[#777] text-12 leading-[17px] overflow-hidden">{list.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {/* 分类  */}
            {CreativityData.category &&
              CreativityData.category.map((item) => {
                if (item.list.length === 0) return null
                return (
                  <div className="flex flex-col mt-10" key={item.title} id={item.title}>
                    <h2 className="text-20 mt-[10px] flex-nowrap">{item.title}</h2>
                    <div className="flex flex-wrap">
                      {item.list.map((list) => {
                        return (
                          <div key={list.uid} title={list.description} onClick={() => handleAddHistory(list, item.title)}>
                            <div className="creative-card flex flex-col relative group w-[216px] h-[116px] mr-[18px] mt-[18px] p-[20px] bg-[#fff] rounded-lg cursor-pointer">
                              <div className="flex absolute right-[10px] top-[8px]">
                                <i
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCollect(list, list.is_wish)
                                  }}
                                  className={`w-4 h-4 ml-3 cursor-pointer iconfont ${list.is_wish === 1 ? 'icon-shoucang-active text-[#FFD400]' : 'icon-shoucang text-[#BBB] hover:text-[#444]'}`}
                                />
                              </div>
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg">
                                  <img alt="" className=" w-7 h-7 rounded-md" src={list.icon} />
                                </div>
                                <span className="text-16 text-[#222] font-semibold ml-[10px]">{list.nickname}</span>
                              </div>
                              <div className="mt-3 text-[#777] text-12 leading-[17px] overflow-hidden">{list.description}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
          <FloatButton.BackTop
            style={{
              right: 30
            }}
            target={() => document.querySelector('.marketing-creativity') as HTMLElement}
          />
        </div>
      </div>
    </div>
  )
}

export default MarketingCreativity
