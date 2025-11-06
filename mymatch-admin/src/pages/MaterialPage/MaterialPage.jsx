/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import {
  Button, Card, Flex, message, Select, Table, Typography, Tag, Space, Modal,
  Descriptions, Spin, Popconfirm, Input
} from 'antd'
import {
  getMaterialsAPI, deleteMaterialAPI, getMaterialDetailAPI, downloadMaterialAPI, getLecturersAPI, getCoursesAPI
} from '../../apis'
import { EyeOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import './MaterialPage.css'

const { Title } = Typography

const MaterialPage = () => {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [lecturers, setLecturers] = useState([])
  const [courses, setCourses] = useState([])

  const [requestParams, setRequestParams] = useState({
    page: 1,
    size: 10,
    sortBy: 'id',
    sortOrder: 'DESC',
    name: '',
    description: '',
    lecturerId: null,
    isPurchased: null,
    courseId: null
  })

  const handleDownload = async (record) => {
    message.loading({ content: 'Preparing download...', key: 'download' })
    try {
      const response = await downloadMaterialAPI(record.id)
      const blob = response.data

      const contentDisposition = response.headers['content-disposition']
      let filename = `material-${record.id}`

      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(contentDisposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      } else if (record.items && record.items.length > 0) {
        filename = record.items[0].originalFileName || filename
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success({ content: 'Download started!', key: 'download', duration: 2 })
    } catch (error) {
      message.error({ content: 'Failed to download material.', key: 'download', duration: 2 })
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: true },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250, sorter: true },
    {
      title: 'Owner',
      dataIndex: ['owner', 'firstName'],
      key: 'ownerName',
      render: (firstName, record) =>
        `${firstName || ''} ${record.owner?.lastName || ''}`.trim() || 'N/A',
      width: 150
    },
    {
      title: 'Course',
      dataIndex: ['course', 'name'],
      key: 'courseName',
      render: (courseName) => courseName || 'N/A',
      width: 150
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render: (price) => price.toLocaleString('vi-VN') + ' đ',
      width: 100
    },
    {
      title: 'Purchased',
      dataIndex: 'isPurchased',
      key: 'isPurchased',
      sorter: true,
      render: (isPurchased) => (
        <Tag color={isPurchased ? 'green' : 'red'}>
          {isPurchased ? 'Yes' : 'No'}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownload(record)}
            title="Download"
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
            title="View Details"
          />
          <Popconfirm
            title="Delete Material"
            description="Are you sure you want to delete this material?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              style={{ color: '#ff4d4f' }}
              title="Delete Material"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const apiParams = {
        page: requestParams.page,
        size: requestParams.size,
        sortBy: requestParams.sortBy,
        sortOrder: requestParams.sortOrder,
        name: requestParams.name || undefined,
        description: requestParams.description || undefined,
        lecturerId: requestParams.lecturerId || undefined,
        ownerId: requestParams.ownerId || undefined,
        courseId: requestParams.courseId || undefined,
        isPurchased: requestParams.isPurchased !== null ? requestParams.isPurchased : undefined,
      }

      const response = await getMaterialsAPI(apiParams)
      setMaterials(response.result?.data || [])
      setTotal(response.result?.totalElements || 0)
    } catch (error) {
      message.error('Failed to fetch materials: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterData = async () => {
    try {
      const [lecturerRes, courseRes] = await Promise.all([
        getLecturersAPI({ page: 1, size: 1000 }),
        getCoursesAPI({ page: 1, size: 1000 })
      ]);
      setLecturers(lecturerRes.result?.data || []);
      setCourses(courseRes.result?.data || []);
    } catch (error) {
      message.error('Failed to fetch filter data: ' + error.message);
    }
  }

  const handleSearch = () => {
    setRequestParams(prev => ({ ...prev, page: 1 }))
  }

  const handleReset = () => {
    setRequestParams({
      page: 1,
      size: 10,
      sortBy: 'id',
      sortOrder: 'DESC',
      name: '',
      description: '',
      lecturerId: null,
      isPurchased: null,
      courseId: null
    })
  }

  const handleDelete = async (id) => {
    try {
      await deleteMaterialAPI(id)
      message.success('Material deleted successfully')
      fetchMaterials()
    } catch (error) {
      message.error('Failed to delete material: ' + error.message)
    }
  }

  const handleViewDetail = async (material) => {
    try {
      setLoadingDetail(true)
      setIsDetailModalVisible(true)
      const response = await getMaterialDetailAPI(material.id)
      setSelectedMaterial(response.result)
    } catch (error) {
      message.error('Failed to fetch material details: ' + error.message)
      setIsDetailModalVisible(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false)
    setSelectedMaterial(null)
  }

  const onDeleteInModal = async () => {
    if (selectedMaterial) {
      await handleDelete(selectedMaterial.id)
      handleCloseDetailModal()
    }
  }

  useEffect(() => {
    fetchFilterData();
  }, [])

  useEffect(() => {
    fetchMaterials()
  }, [requestParams])

  return (
    <div>
      <Title level={3}>Materials Management</Title>

      <Card className="material-filter-card" style={{ marginBottom: 16 }}>
        <Flex horizontal gap="middle" align="center" wrap>
          <Input
            placeholder="Search by name"
            value={requestParams.name}
            onChange={(e) => setRequestParams(prev => ({ ...prev, name: e.target.value, page: 1 }))}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="Search by description"
            value={requestParams.description}
            onChange={(e) => setRequestParams(prev => ({ ...prev, description: e.target.value, page: 1 }))}
            style={{ width: 180 }}
            allowClear
          />
          <Select
            placeholder="Purchased Status"
            style={{ width: 160 }}
            value={requestParams.isPurchased}
            onChange={(value) => setRequestParams(prev => ({ ...prev, isPurchased: value, page: 1 }))}
            allowClear
          >
            <Select.Option value={true}>Purchased</Select.Option>
            <Select.Option value={false}>Not Purchased</Select.Option>
          </Select>
          <Select
            showSearch
            placeholder="Select Lecturer"
            style={{ width: 200 }}
            value={requestParams.lecturerId}
            onChange={(value) => setRequestParams(prev => ({ ...prev, lecturerId: value, page: 1 }))}
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={lecturers.map(l => ({ value: l.id, label: `${l.name} (${l.code})` }))}
          />
          <Select
            showSearch
            placeholder="Select Course"
            style={{ width: 200 }}
            value={requestParams.courseId}
            onChange={(value) => setRequestParams(prev => ({ ...prev, courseId: value, page: 1 }))}
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={courses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))}
          />
          <Button type="primary" onClick={handleSearch}>
            Search Materials
          </Button>
          <Button onClick={handleReset}>
            Reset
          </Button>
        </Flex>
      </Card>

      <Table
        dataSource={materials}
        columns={columns}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          current: requestParams.page,
          pageSize: requestParams.size,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} materials`,
          onChange: (page, size) => {
            setRequestParams(prev => ({ ...prev, page, size }))
          },
          onShowSizeChange: (_, size) => {
            setRequestParams(prev => ({ ...prev, page: 1, size }))
          }
        }}
        onChange={(_, __, sorter) => {
          if (sorter && sorter.field) {
            setRequestParams(prev => ({
              ...prev,
              sortBy: sorter.field,
              sortOrder: sorter.order === 'ascend' ? 'ASC' : 'DESC'
            }))
          }
        }}
        size="middle"
        bordered={false}
      />

      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Material Details</Title>}
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={
          <Flex justify="space-between" align="center">
            <div>
              <Popconfirm
                key="delete"
                title="Delete Material"
                description="Are you sure you want to delete this material?"
                onConfirm={onDeleteInModal}
                okText="Yes"
                cancelText="No"
                placement="topRight"
              >
                <Button danger>Delete</Button>
              </Popconfirm>
            </div>
            <div>
              <Button key="close" onClick={handleCloseDetailModal} style={{ marginLeft: 8 }}>
                Close
              </Button>
            </div>
          </Flex>
        }
        width={800}
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : selectedMaterial ? (
          <Descriptions title="Material Information" bordered column={2}>
            <Descriptions.Item label="Material ID">{selectedMaterial.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedMaterial.name}</Descriptions.Item>
            <Descriptions.Item label="Lecturer">{selectedMaterial.lecturer?.name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Course">{selectedMaterial.course?.name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Owner">
              {`${selectedMaterial.owner?.firstName || ''} ${selectedMaterial.owner?.lastName || ''}`.trim() || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Purchased">
              <Tag color={selectedMaterial.isPurchased ? 'green' : 'red'}>
                {selectedMaterial.isPurchased ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedMaterial.description || <i>(No description)</i>}
            </Descriptions.Item>
            <Descriptions.Item label="Files" span={2}>
              <ul>
                {selectedMaterial.items?.map(item => (
                  <li key={item.id}>
                    <a href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownload(selectedMaterial);
                      }}
                      title="Click to download material"
                    >{item.originalFileName} ({item.size} MB)
                    </a>
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>No details available</p>
        )}
      </Modal>
    </div>
  )
}

export default MaterialPage
