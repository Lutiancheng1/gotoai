import { Modal, Popconfirm } from 'antd'
import React, { useRef, useState } from 'react'
import VideoPlayer from './VideoPlayer'
import { saveAs } from 'file-saver'
import { downloadVideo } from '@/api/MoneyPrinterTurbo'
interface VideoProps {
  url: string
  onDelete?: () => void
}
export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
const Video: React.FC<VideoProps> = ({ url, onDelete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  // video 的时长
  const [duration, setDuration] = useState(0)
  const [modal, contextHolder] = Modal.useModal()
  const handleMouseEnter = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log(error)
        })
      }
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
    }
  }

  const handleDownload = async () => {
    const filePath = url.split('/').slice(4).join('/')
    const res = await downloadVideo(filePath)
    if (res.ok) {
      const blob = await res.blob()
      saveAs(blob, filePath.split('/').pop() || 'download.mp4')
    }
  }
  const handlePreview = () => {
    modal.confirm({
      width: 680,
      icon: null,
      title: null,
      content: <VideoPlayer url={url} />,
      footer: null,
      maskClosable: true
    })
  }

  return (
    <React.Fragment>
      {contextHolder}
      <div className="relative group/video overflow-hidden rounded-[16px] border" onClick={handlePreview} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <video muted ref={videoRef} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} className=" cursor-pointer aspect-video w-full" loop playsInline preload="metadata" src={url} />
        <div className="absolute bottom-[20px] left-[20px] group-hover/video:visible invisible">
          <span className="text-[12px] text-white/[0.4]">{formatDuration(duration)}</span>
        </div>
        <div className="absolute right-[-1px] bottom-[22px] bg-black/[0.6] rounded-l-[10px] px-[10px] py-[16px] flex flex-col gap-[16px] justify-center items-center group-hover/video:translate-x-[-1px] transition duration-500 translate-x-full">
          <div className="size-[20px] cursor-pointer scale-50 group-hover/video:scale-100 delay-100 transition duration-200">
            <i
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              className="iconfont icon-xiazai !text-18 text-white hover:text-[#1677ff]"
            />
          </div>
          <div className="group/active size-[20px] cursor-pointer scale-50 group-hover/video:scale-100 delay-100 transition duration-200">
            <Popconfirm
              title="是否删除该任务？"
              onConfirm={(e) => {
                e?.stopPropagation()
                onDelete?.()
              }}
              onCancel={(e) => {
                e?.stopPropagation()
              }}
              okText="确认"
              okType="danger"
              cancelText="取消"
            >
              <i
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="iconfont icon-shanchu1 !text-18 text-white hover:text-[#1677ff]"
              />
            </Popconfirm>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Video
