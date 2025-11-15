import React, { useEffect, useState } from 'react';
import { Card, Table, Avatar, Typography, Select, Spin, message, Space, Button, Tag, Modal, Input } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../utils/api';

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

function Member() {
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchSemester, setSearchSemester] = useState('');

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

  const fetchMemberDetail = async (id) => {
  setDetailLoading(true);
  try {
    const response = await api.get(`https://mymatch.social/api/student-requests/${id}`);
    if (response.data.code === 200) {
      setSelectedMember(response.data.result);
      setDetailVisible(true);
    } else {
      message.error('Không thể lấy thông tin chi tiết');
    }
  } catch (error) {
    message.error('Lỗi khi lấy thông tin chi tiết');
  } finally {
    setDetailLoading(false);
  }
};

const handleDelete = (record) => {
  confirm({
    title: 'Xác nhận xóa thành viên?',
    content: `Bạn có chắc muốn xóa thành viên ${record.student.user.username}?`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        const response = await api.delete(`/student-requests/${record.id}`);
        if (response.status === 204) {
          message.success('Xóa thành viên thành công');
          await fetchMembers(selectedCampus, pagination.current, pagination.pageSize);
        } else {
          message.error('Xóa thất bại');
        }
      } catch (error) {
        message.error('Lỗi khi xóa thành viên');
      }
    },
  });
};

const filteredMembers = members.filter((member) => {
  const nameMatch = member.student?.user?.username
    .toLowerCase()
    .includes(searchName.toLowerCase());
  const semesterMatch = member.semester?.name
    .toLowerCase()
    .includes(searchSemester.toLowerCase());
  return nameMatch && semesterMatch;
});

  const columns = [
    {
      title: 'Avatar',
      dataIndex: ['student', 'user', 'avatarUrl'],
      key: 'avatar',
      width: 50,
      render: (avatar) => <Avatar src={avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />,
    },
    {
      title: 'Name',
      dataIndex: ['student', 'user', 'username'],
      key: 'name',
      width: 150,
    },
    {
      title: 'Semester',
      dataIndex: ['semester', 'name'],
      key: 'semester',
      width: 100,
    },
    {
      title: 'Campus',
      dataIndex: ['campus', 'name'],
      key: 'campus',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Space>
          <Button type="text" 
            icon={<EyeOutlined />} 
            onClick={() => fetchMemberDetail(record.id)}
            />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Profile list" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <div>
            <Input
            placeholder="Tên thành viên"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 200, marginLeft: 8 }}
            />
        </div>
        <div>
            <Input
            placeholder="Semester"
            value={searchSemester}
            onChange={(e) => setSearchSemester(e.target.value)}
            style={{ width: 200, marginLeft: 8 }}
            />
        </div>
        </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Campus: </Text>
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
          dataSource={filteredMembers}
          rowKey="id"
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: false }}
          onChange={handleTableChange}
          bordered
        />
      )}
      <Modal
  title="Chi tiết thành viên"
  visible={detailVisible}
  onCancel={() => setDetailVisible(false)}
  footer={null}
  width={600}
>
  {detailLoading ? (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <Spin size="large" />
    </div>
  ) : selectedMember ? (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Avatar
          size={64}
          src={selectedMember.student.user.avatarUrl}
          style={{ marginRight: 16 }}
        />
        <div>
          <Text strong>{selectedMember.student.user.username}</Text>
          <div>{selectedMember.student.studentCode}</div>
          <div>{selectedMember.student.user.email}</div>
          <div>{selectedMember.campus.name}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Request ID: </Text> {selectedMember.id}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Class: </Text> {selectedMember.classCode}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Course: </Text> {selectedMember.course.code}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Semester: </Text> {selectedMember.semester.name}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Goal: </Text> {selectedMember.goal}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Request Detail: </Text> {selectedMember.requestDetail}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Skills: </Text>
        {selectedMember.skills.map((s) => (
          <Tag key={s.skill.id} color="blue" style={{ marginBottom: 4 }}>
            {s.skill.name}
          </Tag>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Description: </Text> {selectedMember.description}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Create Date: </Text> {new Date(selectedMember.createAt).toLocaleString()}
      </div>
    </div>
  ) : null}
</Modal>
    </Card>
  );
}

export default Member;
