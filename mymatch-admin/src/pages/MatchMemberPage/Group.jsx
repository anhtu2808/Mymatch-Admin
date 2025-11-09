import React, { useEffect, useState } from 'react'
import { Table, Card, Avatar, Tag, Typography, Spin, message, Space, Button } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../utils/api'

const { Text } = Typography

function Group() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const response = await api.get('https://mymatch.social/api/teams?page=1&size=10')
      if (response.data.code === 200) {
        setTeams(response.data.result.data)
      } else {
        message.error('Không thể tải danh sách nhóm')
      }
    } catch (error) {
      console.error(error)
      message.error('Lỗi khi tải dữ liệu nhóm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 50,
      render: (img) => (
        <Avatar
          src={img || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
          size={48}
        />
      ),
    },
    {
      title: 'Tên nhóm',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
        {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'user', 'username'],
      key: 'createdBy',
      width: 150,
      render: (username) => username || '—',
    },
    {
      title: 'Kỳ học',
      dataIndex: ['semester', 'name'],
      key: 'semester',
      width: 150,
    },
    {
      title: 'Cơ sở',
      dataIndex: ['campus', 'name'],
      key: 'campus',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            // onClick={() => handleViewDetail(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            // onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Danh sách nhóm"
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={teams}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  )
}

export default Group
