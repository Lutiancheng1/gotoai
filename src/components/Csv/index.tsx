import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'

interface CSVPreviewProps {
  url: string // 改为支持 URL
}
let loadingBar = null as HTMLDivElement | null
const CSVPreview: React.FC<CSVPreviewProps> = ({ url }) => {
  const [data, setData] = useState<Array<Array<string | number>>>([])
  const [progress, setProgress] = useState(0) // 加载进度百分比

  useEffect(() => {
    // 估算进度的逻辑可能需要根据实际情况调整
    let estimatedRows = 1000 // 假设的总行数，用于初步估算进度
    let processedRows = 0

    Papa.parse(url, {
      download: true,
      step: (row) => {
        setData((currentData) => [...currentData, row.data] as (string | number)[][])
        processedRows++
        const newProgress = Math.min(Math.round((processedRows / estimatedRows) * 100), 100)
        loadingBar = document.getElementById('loadingBar') as HTMLDivElement
        if (loadingBar) {
          loadingBar.style.setProperty('--progressBar-percent', `${newProgress}%`)
          if (loadingBar.classList.contains('hidden')) {
            loadingBar.classList.remove('hidden') // 显示进度条
          }
          if (newProgress === 100) {
            loadingBar.classList.add('hidden') // 隐藏进度条
          }
        }
      },
      complete: () => {
        setProgress(100) // 完成时设置进度为 100%
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
      },
      header: false // 根据需要设置
    })
  }, [url])

  return (
    <div className="excel-preview-container relative h-[500px]">
      <table>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* <div id="loadingBar">
        <div className="progress">
          <div className="glimmer"></div>
        </div>
      </div> */}
    </div>
  )
}

export default CSVPreview
