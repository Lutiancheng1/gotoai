import React, { useState } from 'react'
import { Button, Dropdown, Flex, Input, Modal, Space, Table, Tooltip, Upload } from 'antd'
import type { MenuProps, TableColumnsType, TableProps, UploadProps } from 'antd'
import { UploadOutlined, InfoCircleOutlined, FolderAddOutlined, DeleteOutlined } from '@ant-design/icons'
import './index.css'
import Toast from '@/components/Toast'
type TableRowSelection<T> = TableProps<T>['rowSelection']

type Ttype = 'txt' | 'docx' | 'pdf' | 'folder'
interface DataType {
  key: React.Key
  name: string
  owner: string
  numberOfNotes: string
  source: string
  uploadTime: string
  type: Ttype
}
export function renderIcon(type: Ttype) {
  switch (type) {
    case 'txt':
      return <i className="iconfont icon-txt !text-[24px] align-sub mr-2"></i>
    case 'docx':
      return <i className="iconfont icon-word !text-[24px] align-sub mr-2"></i>
    case 'pdf':
      return <i className="iconfont icon-pdf !text-[24px] align-sub mr-2"></i>
    case 'folder':
      return <i className="iconfont icon-folder !text-[24px] align-sub mr-2"></i>
    default:
      return ''
  }
}

const dataSource: DataType[] = [
  // {
  //   key: '0',
  //   name: '1',
  //   owner: 'John',
  //   numberOfNotes: '-',
  //   source: '-',
  //   uploadTime: '2024-01-01',
  //   type: 'folder'
  // },
  {
    key: '1',
    name: '未命名.txt',
    owner: 'John',
    numberOfNotes: '10',
    source: 'Local',
    uploadTime: '2024-01-01 12:34',
    type: 'txt'
  },
  {
    key: '2',
    name: '国际贸易.docx',
    owner: 'Jane',
    numberOfNotes: '5',
    source: 'Remote',
    uploadTime: '2024-02-01 23:45',
    type: 'docx'
  },
  {
    key: '3',
    name: '生态环保.pdf',
    owner: 'Jim',
    numberOfNotes: '8',
    source: 'Local',
    uploadTime: '2024-03-01 09:12',
    type: 'pdf'
  }

  // 添加更多数据项...
]

const Knowledge: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<DataType[]>([])
  const [loading, setLoading] = useState(false)
  const [modal, contextHolder] = Modal.useModal()
  // 重命名字段
  const [rename, setRename] = useState('')
  // 重命名modal显示
  const [renameModal, setRenameModal] = useState(false)
  // 当前操作的文件
  const [currentFile, setCurrentFile] = useState<DataType | null>(null)
  const handleMenuClick = (record: DataType, action: string) => {
    setCurrentFile(record)
    switch (action) {
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
        <span onClick={() => handleMenuClick(record, 'download')}>
          <i className="iconfont icon-xiazai"></i> 下载
        </span>
      ),
      key: '0'
    },
    {
      label: (
        <span onClick={() => handleMenuClick(record, 'rename')}>
          <i className="iconfont icon-zhongmingming"></i> 重命名
        </span>
      ),
      key: '1'
    },
    {
      label: (
        <span onClick={() => handleMenuClick(record, 'delete')}>
          <i className="iconfont icon-shanchu"></i> 删除
        </span>
      ),
      key: '3'
    }
  ]
  const columns: TableColumnsType<DataType> = [
    {
      title: '名称',
      dataIndex: 'name',
      sorter: (a, b) => a.name.length - b.name.length,
      ellipsis: {
        showTitle: true
      },
      render(value, record, index) {
        return (
          <>
            {renderIcon(record.type)}
            <span className="cursor-pointer hover:text-[#1677ff]" onClick={() => {}}>
              {value}
            </span>
          </>
        )
      }
    },
    { title: '所有者', dataIndex: 'owner' },
    { title: '笔记数量', dataIndex: 'numberOfNotes' },
    { title: '来源', dataIndex: 'source' },
    { title: '上传时间', dataIndex: 'uploadTime', sorter: (a, b) => new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime() },
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
  const props: UploadProps = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text'
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
      } else if (info.file.status === 'error') {
      }
    }
  }
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

  return (
    <div className="w-full h-full bg-white p-4 doc-knowledge">
      {contextHolder}
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
      <Flex gap="middle" vertical>
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="primary"
              className="bg-[#1677ff]"
              style={{
                display: 'none'
              }}
              icon={<FolderAddOutlined />}
            >
              新建文件夹
            </Button>
            <Upload {...props} className="-mr-2">
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>
            <Tooltip
              title={
                <>
                  <p> 说明：</p>
                  <p>1.支持上传的资料格式:docx/pdf/txt;</p>
                  <p>2.单个资料上传不超过500M;</p>
                </>
              }
            >
              <InfoCircleOutlined className="!text-[12px] text-[#bbb]" rotate={180} />
            </Tooltip>
            <span
              style={{
                opacity: !hasSelected ? '0.5' : '1',
                cursor: !hasSelected ? 'not-allowed' : 'pointer'
              }}
              onClick={deleteDocs}
            >
              <DeleteOutlined className="mr-1" />
              删除
            </span>
            <span
              style={{
                opacity: !hasSelected ? '0.5' : '1',
                cursor: !hasSelected ? 'not-allowed' : 'pointer',
                display: 'none'
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
export default Knowledge
