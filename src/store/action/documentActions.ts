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
export const delDocument = createAsyncThunk('document/delDocument', async (id: string | number, { dispatch }) => {
  const res = (await http.get('/Document/DeleteFile?fileId=' + id)) as { code: number; msg: string; data: any }
  if (!res.data) return Toast.notify({ type: 'error', message: res.msg })
  return res
})
