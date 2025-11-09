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

  const fetchMembers = async (campusId) => {
    if (!campusId) return;
    setLoading(true);
    try {
      const res = await api.get(`https://mymatch.social/api/student-requests?campusId=${campusId}&page=1&size=10`);
      if (res.data.code === 200) {
        setMembers(res.data.result.data);
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
    fetchMembers(selectedCampus);
  }, [selectedCampus]);

  const columns = [
    {
      title: 'Avatar',
      dataIndex: ['student', 'user', 'avatarUrl'],
      key: 'avatar',
      render: (avatar) => <Avatar src={avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />,
    },
    {
      title: 'Tên',
      dataIndex: ['student', 'user', 'username'],
      key: 'name',
    },
    {
      title: 'Khóa học',
      dataIndex: ['course', 'code'],
      key: 'course',
    },
    {
      title: 'Kỳ học',
      dataIndex: ['semester', 'name'],
      key: 'semester',
    },
    {
      title: 'Cơ sở',
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
    <Card title="Danh sách thành viên" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
          pagination={{ pageSize: 10 }}
          bordered
        />
      )}
    </Card>
  );
}

export default Member;
