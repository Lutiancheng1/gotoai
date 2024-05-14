import React, { useEffect, useState } from 'react'
import { useMount } from 'ahooks'
import { Empty, FloatButton, Input, Skeleton, Tag } from 'antd'
import { handleCopyClick } from '@/components/Dialogue'
import { downloadImage } from './index_new'
import { SearchOutlined } from '@ant-design/icons'
import { ITab } from './constant'
import Loading from '../Loading'
import 'wc-waterfall'
import './gallery.css'
const galleryData = require('@/mocks/gallery.json') as { data: Image[] }
// 定义images数组中对象的类型
interface Image {
  url: string
  prompt: string
  fullCommand: string
  tags?: any[]
}

// 定义Gallery组件props的类型
interface GalleryProps {
  itemClick: (key: ITab, prompt?: string) => void
}

const Gallery: React.FC<GalleryProps> = ({ itemClick }) => {
  const [imageList, setImageList] = useState<Image[]>()
  // 将galleryData中的data分页拆分 一页50个 记住当前页
  const [currentPage, setCurrentPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const pageSize = 50
  // const [loading, setLoading] = useState(false)
  const handleSearch = (value: string) => {
    setSearchValue(value)
    document.querySelector('#load')?.classList.remove('!flex')
    if (value.trim() === '') {
      document.querySelector('#load')?.classList.add('!flex')
      return setImageList(galleryData.data.slice(currentPage * pageSize, (currentPage + 1) * pageSize))
    }
    const lowerCaseValue = value.toLowerCase()
    const result = galleryData.data.filter((item) => item.prompt.toLowerCase().includes(lowerCaseValue))
    setImageList(result)
  }
  useMount(() => {
    setImageList(galleryData.data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)) // 修改这里
    setTimeout(() => {
      document.querySelector('#load')?.classList.add('!flex')
    }, 2000)
  })
  // 计算列数
  const calculateSpan = () => {
    if (window.innerWidth > 2100) {
      return 8
    } else if (window.innerWidth > 1600) {
      return 6
    } else if (window.innerWidth > 1200) {
      return 5
    } else if (window.innerWidth > 900) {
      return 4
    } else {
      return 3
    }
  }
  const [columnSpan, setColumnSpan] = useState(calculateSpan())
  //  设置列数
  useEffect(() => {
    const handleResize = () => {
      setColumnSpan(calculateSpan())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const handleLoadMore = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1
      const start = nextPage * pageSize

      // 如果已经到达数据的末尾，直接返回
      if (start >= galleryData.data.length) {
        return prevPage
      }

      const nextImageList = galleryData.data.slice(start, start + pageSize)

      // 更新图片列表
      setImageList((prevList) => [...prevList!, ...nextImageList])

      // 返回新的页码
      return nextPage
    })
  }
  return (
    <div className="gallery w-full h-auto min-h-[100%] overflow-scroll mt-3 px-3 pb-3">
      <Input width={'100%'} className="mb-3 rounded-full" value={searchValue} onChange={(e) => handleSearch(e.target.value)} suffix={<SearchOutlined />} allowClear placeholder="搜索prompt提示或关键词" variant="filled" />
      {!imageList && <Loading />}
      {imageList && imageList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      <wc-waterfall gap={12} cols={columnSpan}>
        {imageList &&
          imageList.map((image, index) => (
            <div className="grid-item mb-3 w-[200px] animate__animated animate__fadeIn fadeIn" key={index}>
              <div className="rounded-md shadow-md">
                <div className="images-wrapper relative overflow-hidden rounded-md bg-[#e8eaf0] ">
                  <div className="cursor-pointer backdrop-blur-sm">
                    <img loading="eager" src={image.url} alt="" style={{ width: '100%', objectFit: 'fill' }} />
                  </div>
                  <footer className="absolute bottom-2 left-1 right-1 z-20 backdrop-blur-sm">
                    <div className="rounded-md bg-black/50 p-2">
                      <h2 className="line-clamp-3 text-white">{image.prompt}</h2>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Tag onClick={() => itemClick('imageCreation', image.prompt)} color="cyan" className="flex cursor-pointer opacity-60" icon={<i className="!size-[14px] iconfont icon-hf_zxphuatu mr-1"></i>}>
                            画同款
                          </Tag>
                          <Tag onClick={() => handleCopyClick(image.prompt)} color="cyan" className="flex cursor-pointer opacity-60" icon={<i className="!size-[14px] iconfont icon-icon_fuzhi mr-1"></i>}>
                            复制
                          </Tag>
                          <Tag onClick={() => downloadImage(image.url)} color="cyan" className="flex cursor-pointer opacity-60" icon={<i className="!size-[14px] iconfont icon-xiazaitupian mr-1"></i>}>
                            下载
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          ))}
      </wc-waterfall>
      {imageList && (
        <div id="load" className="mt-4 items-center justify-center cursor-pointer hidden">
          <Tag onClick={handleLoadMore} className="flex" icon={<i className="iconfont icon-xia flex size-[6px] mr-3"></i>}>
            {galleryData.data.length === imageList.length ? '没有更多了' : '加载更多'}
          </Tag>
        </div>
      )}
      <FloatButton.BackTop
        style={{
          right: 30
        }}
        className="hover:bg-slate-100"
        target={() => document.querySelector('.gallery') as HTMLElement}
      />
    </div>
  )
}

export default Gallery
