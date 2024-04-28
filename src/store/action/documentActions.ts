import { http } from '@/utils/axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Toast from '@/components/Toast'
import { DocFile, saveFileList, updateFileList } from '../reducers/document'
export type DocumentParams = Partial<{
  keywords: string
  page: number
  pageSize: number
  sort: string
  order: string
  startTime: string
  endTime: string
}>
export type DocumentRes = {
  code: number
  key: string | null
  msg: string
  rows: DocFile[]
  recordCount: number
  pageCount: number
  pageIndex: number
  ext: string | null
}
// 获取文档列表

export const getDocumentList = createAsyncThunk('document/getDocumentList', async (params: DocumentParams, { dispatch }) => {
  const res = (await http.post('/Document/UserFiles', params)) as DocumentRes
  if (!res.rows) return Toast.notify({ type: 'error', message: res.msg })
  const { recordCount, pageCount, pageIndex, rows } = res
  if (params.page === 1) {
    dispatch(saveFileList({ pageCount, pageIndex, recordCount, rows }))
  } else {
    dispatch(updateFileList({ pageCount, pageIndex, recordCount, rows }))
  }
  return res
})
// 删除文件
/**
 * Deletes a document asynchronously.
 * @param id - The ID of the document to delete.
 * @returns A Promise that resolves to the response from the server.
 */
export const delDocument = createAsyncThunk('document/delDocument', async (id: string | number, { dispatch }) => {
  const res = (await http.get('/Document/DeleteFile?fileId=' + id)) as { code: number; msg: string; data: any }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res
})

// 获取文档总结
/**
 * Retrieves the summary of a document.
 * @param id - The ID of the document.
 * @returns A Promise that resolves to the document summary.
 */
export const getDocumentSummary = createAsyncThunk('document/getDocumentSummary', async (id: string) => {
  const res = await http.get('/Document/FileSummary?fileId=' + id)
  if (!res.data) return Toast.notify({ type: 'error', message: '获取文档总结失败' })
  return res
})

// 根据文档id取得对话消息列表
export const getDocumentMessages = createAsyncThunk('document/getDocumentMessages', async (id: string) => {
  const res = await http.get('/Document/MessageList?fileId=' + id)
  return res
})

// 从系统文件拷贝新的文档
export const copyDocument = createAsyncThunk('document/copyDocument', async () => {
  const res = (await http.get('/Document/CopySystem')) as { code: number; msg: string; data: { fileId: string; url: string } }
  return res
})
