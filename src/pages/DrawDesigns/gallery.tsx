import React, { useEffect, useRef, useState } from 'react'
import Masonry from 'masonry-layout'
import imagesLoaded from 'imagesloaded'
import { useAsyncEffect, useMount } from 'ahooks'
const galleryData = require('@/mocks/gallery.json') as { data: Image[] }
// 定义images数组中对象的类型
interface Image {
  url: string
  prompt: string
  fullCommand: string
  tags?: any[]
}

// 定义Gallery组件props的类型
interface GalleryProps {}

const Gallery: React.FC<GalleryProps> = () => {
  // 明确指定gridRef是对HTMLDivElement的引用
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [imageList, setImageList] = useState<Image[]>([])
  // 将galleryData中的data分页拆分 一页50个 记住当前页
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50
  const [loading, setLoading] = useState(false)

  useMount(() => {
    setImageList(galleryData.data.slice((currentPage - 1) * pageSize, currentPage * pageSize))
  })
  useEffect(() => {
    const grid = gridRef.current

    if (grid) {
      // 初始化Masonry
      const msnry = new Masonry(grid, {
        itemSelector: '.grid-item',
        columnWidth: 200,
        gutter: 10,
        transitionDuration: '0.2s',
        stagger: 30,
        hiddenStyle: {
          opacity: 0
        },
        visibleStyle: {
          opacity: 1
        },
        resize: true
      })
      console.log(msnry, 'msnry')

      msnry.layout && msnry.layout()
      // 使用imagesLoaded确保所有图片加载完成后再进行布局
      imagesLoaded(grid, () => {
        console.log('layoutComplete')
        msnry.layout && msnry.layout()
      })

      // 清理函数
      return () => {
        msnry.destroy && msnry.destroy()
      }
    }
  }, [])

  return (
    <div className="gallery w-full h-auto min-h-[100%] ml-3 overflow-scroll pt-3" ref={gridRef}>
      {imageList &&
        imageList.map((image, index) => (
          <div className="grid-item mb-3 w-[200px] animate__animated animate__fadeIn" key={index}>
            <div className="rounded-md shadow-md">
              <div className="images-wrapper overflow-hidden rounded-md bg-[#e8eaf0] ">
                <div className="cursor-pointer backdrop-blur-sm">
                  <img loading="eager" src={image.url} alt="" style={{ width: '100%', objectFit: 'fill' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default Gallery
