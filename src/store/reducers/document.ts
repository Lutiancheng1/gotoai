import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createTempChat } from '../action/talkActions'
export type DocFile = {
  id: number
  fileid: string
  userid: number
  name: string
  path: string
  extension: string
  createtime: string
  mimetype: string
  size: number
  menu: number
  indexuri: string
  summary: string // 文档总结
  conversationid: string
  chatId: number
}
export type FileList = {
  rows: DocFile[]
  recordCount: number
  pageCount: number
  pageIndex: number
  empty?: boolean
}
export type DocumentInitState = {
  fileList: FileList
  isNewDoc: boolean
  currentFile: DocFile
  docLoading: boolean
  tempConversationId?: string
}
const initialState = {
  fileList: {
    rows: [] as DocFile[],
    recordCount: 0,
    pageCount: 0,
    pageIndex: 0,
    empty: true
  },
  isNewDoc: true,
  currentFile: {},
  docLoading: false
} as DocumentInitState

const DocumentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    // 保存文件列表
    saveFileList(state, { payload }: PayloadAction<FileList>) {
      const { rows, recordCount, pageCount, pageIndex } = payload
      state.fileList.rows = rows
      state.fileList.recordCount = recordCount
      state.fileList.pageCount = pageCount
      state.fileList.pageIndex = pageIndex
      state.fileList.empty = false
    },
    // 更新文件列表
    updateFileList(state, { payload }: PayloadAction<FileList>) {
      const { rows, recordCount, pageCount, pageIndex } = payload
      state.fileList.rows = state.fileList.rows.concat(rows)
      state.fileList.recordCount = recordCount
      state.fileList.pageCount = pageCount
      state.fileList.pageIndex = pageIndex
      state.fileList.empty = false
    },
    updateCurrentFile(state, { payload }: PayloadAction<DocFile>) {
      state.currentFile = payload
      state.isNewDoc = false
    },
    // 更新loading状态
    updateDocLoading(state, { payload }: PayloadAction<boolean>) {
      state.docLoading = payload
    },
    // 切换is newdoc
    toggleIsNewDoc(state, { payload }: PayloadAction<boolean>) {
      state.isNewDoc = payload
      if (payload) state.currentFile = {} as DocFile
    },
    // 初始化数据
    initState(state) {
      state.isNewDoc = true
      state.currentFile = {} as DocFile
      state.fileList = {
        recordCount: 0,
        pageCount: 0,
        pageIndex: 0,
        rows: [],
        empty: true
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(createTempChat.fulfilled, (state, { payload }) => {
      state.tempConversationId = payload
    })
  }
})

export const { saveFileList, updateFileList, updateCurrentFile, initState, updateDocLoading, toggleIsNewDoc } = DocumentSlice.actions

export default DocumentSlice.reducer
