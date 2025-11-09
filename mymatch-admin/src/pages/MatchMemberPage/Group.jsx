import React, { useEffect, useState } from 'react'
import { Table, Card, Avatar, Tag, Typography, Spin, message, Space, Button, Modal, Descriptions, Divider } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../utils/api'

const { Text } = Typography

function Group() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 10,
  total: 0,
});
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  console.log("selectedTeam", selectedTeam);
  const fetchTeams = async (page = 1, size = 10) => {
  setLoading(true);
  try {
    const response = await api.get(`https://mymatch.social/api/teams?page=${page}&size=${size}`);
    if (response.data.code === 200) {
      setTeams(response.data.result.data);
      setPagination({
        current: response.data.result.currentPage,
        pageSize: response.data.result.pageSize,
        total: response.data.result.totalElements,
      });
    } else {
      message.error('Không thể tải danh sách nhóm');
    }
  } catch (error) {
    console.error(error);
    message.error('Lỗi khi tải dữ liệu nhóm');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTeams(pagination.current, pagination.pageSize)
  }, [])

  const handleTableChange = (newPagination) => {
  fetchTeams(newPagination.current, newPagination.pageSize);
};

  const handleViewDetail = async (teamId) => {
    setLoading(true);
    try {
      const response = await api.get(`https://mymatch.social/api/teams/${teamId}`);
      if (response.data.code === 200) {
        setSelectedTeam(response.data.result);
        setDetailVisible(true);
      } else {
        message.error('Không thể tải chi tiết nhóm');
      }
    } catch (error) {
      message.error('Lỗi khi tải chi tiết nhóm');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => handleViewDetail(record.id)}
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
        <>
        <Table
          columns={columns}
          dataSource={teams}
          rowKey="id"
          loading={loading}
          pagination={{
          ...pagination,
          showSizeChanger: false,
        }}
          onChange={handleTableChange}
          bordered
        />

        <Modal
            title={selectedTeam?.name || 'Chi tiết nhóm'}
            visible={detailVisible}
            onCancel={() => setDetailVisible(false)}
            footer={[<Button key="close" onClick={() => setDetailVisible(false)}>Đóng</Button>]}
            width={800}
          >
            {selectedTeam && (
              <>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Tên nhóm" span={2}>{selectedTeam.name}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={2}>{selectedTeam.description || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Course Code">{selectedTeam.course.code}</Descriptions.Item>
                  <Descriptions.Item label="Người tạo">{selectedTeam.createdBy.user.username}</Descriptions.Item>
                  <Descriptions.Item label="Student Code">{selectedTeam.createdBy.studentCode}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedTeam.createdBy.user.email}</Descriptions.Item>
                  <Descriptions.Item label="Kỳ học">{selectedTeam.semester.name}</Descriptions.Item>
                  <Descriptions.Item label="Cơ sở">{selectedTeam.campus.name}</Descriptions.Item>
                  <Descriptions.Item label="Số lượng thành viên">{selectedTeam.memberCount}/{selectedTeam.memberMax}</Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">{new Date(selectedTeam.createAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>

                <Divider>Danh sách thành viên</Divider>
                {selectedTeam.teamMember.map((tm) => (
                  <div key={tm.id} style={{ marginBottom: 10 }}>
                    <Avatar src={tm.member.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} size={32} />
                    <Text style={{ marginLeft: 8 }}>
                      {tm.member.name || '—'} ({tm.member.note || '-'})
                    </Text>
                    <div style={{ marginLeft: 40, marginTop: 4 }}>
                      {tm.member.memberSkills.map((ms) => (
                        <Tag key={ms.id}>{ms.skill.name}</Tag>
                      ))}
                    </div>
                  </div>
                ))}

                <Divider>Yêu cầu tuyển thành viên</Divider>
                {selectedTeam.teamRequest.map((tr) => (
                  <div key={tr.id} style={{ marginBottom: 10 }}>
                    <Text strong>{tr.title}</Text>
                    <div>
                      {tr.skills.map((s) => (
                        <Tag key={s.id}>{s.skill.name}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Modal>
        </>
      )}
    </Card>
  )
}

export default Group
