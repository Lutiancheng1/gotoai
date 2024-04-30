import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import './index.css'

interface ExcelPreviewProps {
  url: string // 仅支持 URL
}
let loadingBar = null as HTMLDivElement | null
const ExcelPreview: React.FC<ExcelPreviewProps> = ({ url }) => {
  const [data, setData] = useState<Array<Array<string | number | boolean>>>([])
  useEffect(() => {
    const loadData = () => {
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
          const reader = new FileReader()
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const binaryStr = e.target?.result
            if (binaryStr) {
              const workBook = XLSX.read(binaryStr, { type: 'binary' })
              const workSheetName = workBook.SheetNames[0]
              const workSheet = workBook.Sheets[workSheetName]
              const data: (string | number | boolean)[][] = XLSX.utils.sheet_to_json(workSheet, { header: 1 })
              setData(data)
            }
          }
          reader.readAsBinaryString(blob)
        }
      }

      xhr.onerror = () => {
        console.error('Error loading Excel file')
      }

      xhr.send()
    }

    loadData()
  }, [url])

  return (
    <div className="excel-preview-container relative  h-[500px]">
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

export default ExcelPreview
