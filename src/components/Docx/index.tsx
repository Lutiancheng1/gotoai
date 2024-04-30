import React, { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import './index.css'

interface WordPreviewProps {
  url: string // 仅支持 URL
}
let loadingBar = null as HTMLDivElement | null
const WordPreview: React.FC<WordPreviewProps> = ({ url }) => {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDocument = () => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob' // 以 Blob 的形式接收数据

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          loadingBar = document.getElementById('loadingBar') as HTMLDivElement
          if (loadingBar) {
            loadingBar.style.setProperty('--progressBar-percent', `${percentComplete}%`)
            if (loadingBar.classList.contains('hidden')) {
              loadingBar.classList.remove('hidden') // 显示进度条
            }
            if (percentComplete === 100) {
              loadingBar.classList.add('hidden') // 隐藏进度条
            }
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response
          renderAsync(blob, previewRef.current!, undefined, {
            className: 'docx',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: false,
            trimXmlDeclaration: true,
            useBase64URL: true,
            renderChanges: false,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            debug: false
          })
            .then(() => {})
            .catch(console.error)
        }
      }

      xhr.onerror = () => {
        console.error('Error loading Word file')
      }

      xhr.send()
    }

    loadDocument()
  }, [url])

  return (
    <div className="word-preview-container relative h-[500px]">
      <div ref={previewRef}></div>
      {/* <div id="loadingBar">
        <div className="progress">
          <div className="glimmer"></div>
        </div>
      </div> */}
    </div>
  )
}

export default WordPreview
