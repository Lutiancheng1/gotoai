import React, { useState } from 'react'
import { Button, Dropdown, Flex, Input, Modal, Table, Tooltip, Upload } from 'antd'
import type { MenuProps, TableColumnsType, TableProps, UploadProps } from 'antd'
import { UploadOutlined, InfoCircleOutlined, FolderAddOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'
import Toast from '@/components/Toast'
type TableRowSelection<T> = TableProps<T>['rowSelection']

type Ttype = 'txt' | 'docx' | 'pdf' | 'folder'
interface DataType {
  key: React.Key
  name: string
  owner: string
  docType: string
  uploadTime: string
  type: Ttype
}

const dataSource: DataType[] = [
  {
    key: '0',
    name: 'AI算力可行性研究报告',
    owner: 'John',
    uploadTime: '2024-01-01 15:02',
    docType: '调研报告',
    type: 'docx'
  },
  {
    key: '1',
    name: '可行性研究报告1',
    owner: 'John',
    uploadTime: '2024-01-01 18:23',
    docType: '研究报告',
    type: 'docx'
  },
  {
    key: '2',
    name: '广东省广州市建立AI算力中心的可行性研究报告',
    owner: 'Jane',
    uploadTime: '2024-02-01 12:34',
    docType: '通用报告',
    type: 'docx'
  },
  {
    key: '可行性研究报告',
    name: '333',
    owner: 'Jim',
    uploadTime: '2024-03-01 09:10',
    type: 'docx',
    docType: '调研报告'
  }

  // 添加更多数据项...
]

const MyDoc: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<DataType[]>([])
  const [loading, setLoading] = useState(false)
  // 重命名字段
  const [rename, setRename] = useState('')
  // 重命名modal显示
  const [renameModal, setRenameModal] = useState(false)
  // 当前操作的文件
  const [currentFile, setCurrentFile] = useState<DataType | null>(null)
  const [modal, contextHolder] = Modal.useModal()
  // 新建文档的显示隐藏
  const [visible, setVisible] = useState(false)
  // 新建文档name
  const [docName, setDocName] = useState('')
  const handleMenuClick = (record: DataType, action: string) => {
    setCurrentFile(record)
    switch (action) {
      case 'copy':
        // Your copy logic here
        console.log('Copy', record)
        break
      case 'download':
        // Your download logic here
        console.log('Download', record)
        break
      case 'rename':
        setRenameModal(true)
        setRename(record.name)
        console.log('Rename', record)
        break
      case 'delete':
        deleteDoc(record)
        break
      default:
        break
    }
  }

  const getMenuItems = (record: DataType): MenuProps['items'] => [
    {
      label: (
        <span onClick={() => handleMenuClick(record, 'copy')}>
          <i className="iconfont icon-icon_fuzhi"></i> 复制
        </span>
      ),
      key: 0
    },
    {
      label: (
        <span onClick={() => handleMenuClick(record, 'download')}>
          <i className="iconfont icon-xiazai"></i> 下载
        </span>
      ),
      key: 1
    },
    {
      label: (
        <span onClick={() => handleMenuClick(record, 'rename')}>
          <i className="iconfont icon-zhongmingming"></i> 重命名
        </span>
      ),
      key: 2
    },
    {
      label: (
        <span onClick={() => handleMenuClick(record, 'delete')}>
          <i className="iconfont icon-shanchu"></i> 删除
        </span>
      ),
      key: 3
    }
  ]
  const columns: TableColumnsType<DataType> = [
    {
      title: '名称',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ellipsis: {
        showTitle: true
      },
      render(value, record, index) {
        return (
          <>
            <i className="iconfont icon-word !text-[24px] align-sub mr-2"></i>
            <Tooltip title={value}>
              <span className="cursor-pointer hover:text-[#1677ff]" onClick={() => window.open(`docDetail/${record.key}`)}>
                {value}
              </span>
            </Tooltip>
          </>
        )
      }
    },
    { title: '文档类型', dataIndex: 'docType' },
    { title: '负责人', dataIndex: 'owner' },
    { title: '创建时间', dataIndex: 'uploadTime', sorter: (a, b) => new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime() },
    {
      title: '操作',
      dataIndex: 'operation',
      render(value, record, index) {
        return (
          <Dropdown arrow menu={{ items: getMenuItems(record) }} trigger={['click']}>
            <i className="iconfont icon-dian cursor-pointer !text-[18px] hover:text-[#1677ff]"></i>
          </Dropdown>
        )
      }
    }
  ]
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
    const selectedRows = dataSource.filter((item) => newSelectedRowKeys.includes(item.key))
    setSelectedRows(selectedRows)
  }

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange
  }

  const hasSelected = selectedRowKeys.length > 0
  const closeRenameModal = () => {
    setRenameModal(false)
    setRename('')
    setCurrentFile(null)
  }
  // 单个删除
  const deleteDoc = (record: DataType) => {
    console.log(record, 'record')

    modal.confirm({
      title: '提示',
      content: '确认要删除该文档吗?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      maskClosable: true,
      onOk() {
        Toast.notify({ type: 'success', message: '删除成功' })
      }
    })
  }
  // 多个删除
  const deleteDocs = () => {
    console.log(selectedRowKeys, selectedRows, 'selectedRowKeys')
    if (!hasSelected) return
    modal.confirm({
      title: '提示',
      content: '确认要删除选中的文档吗?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      maskClosable: true,
      onOk() {
        Toast.notify({ type: 'success', message: '删除成功' })
      }
    })
  }
  const createDoc = async () => {
    if (docName.trim() === '') return Toast.notify({ type: 'info', message: '请输入文档名称' })
    await setVisible(false)
    setDocName('')
    Toast.notify({ type: 'success', message: '创建成功' })
    setTimeout(() => {
      window.open(`docDetail/${new Date().getTime()}`)
    }, 100)
  }
  return (
    <div className="w-full h-full bg-white p-4 doc-mydoc">
      {contextHolder}
      {/* 重命名 */}
      <Modal
        title="重命名"
        open={renameModal}
        onOk={() => {
          console.log(currentFile, rename)
          closeRenameModal()
        }}
        width={650}
        onCancel={closeRenameModal}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <div className="h-[100px] p-4">
          <div className="flex justify-center items-center">
            <span className="required w-14">名称</span>
            <Input
              placeholder="请输入文档名称"
              value={rename}
              onChange={(e) => {
                setRename(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>
      {/* 新建文档 */}
      <Modal
        title="新建文档"
        open={visible}
        onOk={createDoc}
        width={650}
        onCancel={() => {
          setVisible(false)
          setDocName('')
        }}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <div className="h-[100px] p-4">
          <div className="flex justify-center items-center">
            <span className="required w-14">名称</span>
            <Input
              placeholder="请输入文档名称"
              value={docName}
              onChange={(e) => {
                setDocName(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>
      <Flex gap="middle" vertical>
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button type="primary" className="bg-[#1677ff]" icon={<FolderAddOutlined />} onClick={() => setVisible(true)}>
              新建
            </Button>
            <span
              onClick={deleteDocs}
              style={{
                opacity: !hasSelected ? '0.5' : '1',
                cursor: !hasSelected ? 'not-allowed' : 'pointer'
              }}
            >
              <DeleteOutlined className="mr-1" />
              删除
            </span>
            <span
              className="hidden"
              style={{
                opacity: !hasSelected ? '0.5' : '1',
                cursor: !hasSelected ? 'not-allowed' : 'pointer'
              }}
            >
              <i className="iconfont icon-move mr-1"></i>移动
            </span>
          </div>
          <div>
            <Input.Search placeholder="搜索"></Input.Search>
          </div>
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={dataSource} />
      </Flex>
    </div>
  )
}
export default MyDoc
