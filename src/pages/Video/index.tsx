import React, { useRef } from 'react'
import History from '@/components/history'
import './index.css'
import InitPage from '@/components/InitPage'
import Dialogue from '@/components/Dialogue'
import { UserPrompt } from '../Talk'
export default function Video() {
  // 获取子组件实例
  const dialogueRef = useRef<{ sendBeta: (fromPrompt?: boolean, prompt?: UserPrompt, needResponse?: boolean) => Promise<void> }>()
  const onPrompt = (item: UserPrompt) => {
    console.log(item)
    dialogueRef.current?.sendBeta(true, item, true)
  }
  return (
    <div className="video">
      <History />
      <div className="video-container">
        <div className="video-box">
          <InitPage onPromptClick={onPrompt} />
          <Dialogue ref={dialogueRef} />
        </div>
      </div>
    </div>
  )
}
