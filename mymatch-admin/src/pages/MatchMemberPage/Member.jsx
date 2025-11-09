import React, { useEffect, useState } from 'react';
import { Card, Table, Avatar, Typography, Select, Spin, message, Space, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import api from '../../utils/api';

const { Text } = Typography;
const { Option } = Select;

function Member() {
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchCampuses = async () => {
    try {
      const res = await api.get('https://mymatch.social/api/campuses?page=1&size=10');
      if (res.data.code === 200) {
        setCampuses(res.data.result.data);
        if (res.data.result.data.length > 0) {
          setSelectedCampus(res.data.result.data[0].id); 
        }
      } else {
        message.error('Không thể tải danh sách cơ sở');
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách cơ sở');
    }
  };

  const fetchMembers = async (campusId, page = 1, size = 10) => {
    if (!campusId) return;
    setLoading(true);
    try {
      const response = await api.get(`https://mymatch.social/api/student-requests?campusId=${campusId}&page=${page}&size=${size}`);
      if (response.data.code === 200) {
        setMembers(response.data.result.data);
        setPagination({
          current: response.data.result.currentPage,
          pageSize: response.data.result.pageSize,
          total: response.data.result.totalElements,
        });
      } else {
        message.error('Không thể tải danh sách thành viên');
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    fetchMembers(selectedCampus, pagination.current, pagination.pageSize);
  }, [selectedCampus]);

  const handleTableChange = (newPagination) => {
    fetchMembers(selectedCampus, newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: ['student', 'user', 'avatarUrl'],
      key: 'avatar',
      render: (avatar) => <Avatar src={avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />,
    },
    {
      title: 'Name',
      dataIndex: ['student', 'user', 'username'],
      key: 'name',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'code'],
      key: 'course',
    },
    {
      title: 'Semester',
      dataIndex: ['semester', 'name'],
      key: 'semester',
    },
    {
      title: 'Campus',
      dataIndex: ['campus', 'name'],
      key: 'campus',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" 
            icon={<EyeOutlined />} 
            // onClick={() => handleViewDetail(record.id)} 
            />
          {/* <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          /> */}
        </Space>
      ),
    },
  ];

  return (
    <Card title="Profile list" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Chọn cơ sở: </Text>
        <Select
          value={selectedCampus}
          onChange={setSelectedCampus}
          style={{ width: 200, marginLeft: 8 }}
        >
          {campuses.map((campus) => (
            <Option key={campus.id} value={campus.id}>
              {campus.name}
            </Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: false }}
          onChange={handleTableChange}
          bordered
        />
      )}
    </Card>
  );
}

export default Member;
