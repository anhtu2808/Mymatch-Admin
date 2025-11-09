import React, { useEffect, useState } from 'react';
import { Table, Card, Avatar, Tag, Typography, Spin, message, Space, Button, Modal, Descriptions, Divider, Input, Row, Col } from 'antd';
import { EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../utils/api';

const { Text } = Typography;
const { confirm } = Modal;

function Group() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [filters, setFilters] = useState({
    name: '',
    semester: '',
    campus: '',
  });

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
    fetchTeams(pagination.current, pagination.pageSize);
  }, []);

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

  //   const handleDelete = (record) => {
//     confirm({
//       title: 'Bạn có chắc muốn xóa nhóm này?',
//       icon: <ExclamationCircleOutlined />,
//       content: `Tên nhóm: ${record.name}`,
//       okText: 'Xóa',
//       okType: 'danger',
//       cancelText: 'Hủy',
//       async onOk() {
//         try {
//           const response = await api.delete(`/teams/${record.id}`);
//           if (response.status === 204) {
//             message.success('Xóa nhóm thành công');
//             await fetchTeams(pagination.current, pagination.pageSize);
//           } else {
//             message.error(`Xóa nhóm thất bại (status: ${response.status})`);
//           }
//         } catch (error) {
//           message.error('Lỗi khi xóa nhóm: ' + error.message);
//         }
//       },
//     });
//   };

  const filteredTeams = teams.filter((team) => {
    return (
      team.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (team.semester?.name || '').toLowerCase().includes(filters.semester.toLowerCase()) &&
      (team.campus?.name || '').toLowerCase().includes(filters.campus.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'image',
      key: 'image',
      width: 50,
      render: (img) => <Avatar src={img || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} size={48} />,
    },
    { title: 'Group name', dataIndex: 'name', key: 'name', width: 150, render: (text) => <Text strong>{text}</Text> },
    { title: 'Create By', dataIndex: ['createdBy', 'user', 'username'], key: 'createdBy', width: 150, render: (username) => username || '—' },
    { title: 'Semester', dataIndex: ['semester', 'name'], key: 'semester', width: 150 },
    { title: 'Campus', dataIndex: ['campus', 'name'], key: 'campus', width: 150 },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
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
    <Card title="Group list" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Search filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="Search by group name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            allowClear
          />
        </Col>
        <Col>
          <Input
            placeholder="Search by semester"
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            allowClear
          />
        </Col>
        <Col>
          <Input
            placeholder="Search by campus"
            value={filters.campus}
            onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
            allowClear
          />
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={filteredTeams}
            rowKey="id"
            loading={loading}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={handleTableChange}
            bordered
          />

          {/* Detail modal */}
          <Modal
            title={selectedTeam?.name || 'Chi tiết nhóm'}
            visible={detailVisible}
            onCancel={() => setDetailVisible(false)}
            footer={[<Button key="close" onClick={() => setDetailVisible(false)}>Close</Button>]}
            width={800}
          >
            {selectedTeam && (
              <>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Name" span={2}>{selectedTeam.name}</Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>{selectedTeam.description || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Request ID" span={2}>{selectedTeam.id || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Course">{selectedTeam.course.code}</Descriptions.Item>
                  <Descriptions.Item label="Create By">{selectedTeam.createdBy.user.username}</Descriptions.Item>
                  <Descriptions.Item label="Student Code">{selectedTeam.createdBy.studentCode}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedTeam.createdBy.user.email}</Descriptions.Item>
                  <Descriptions.Item label="Semester">{selectedTeam.semester.name}</Descriptions.Item>
                  <Descriptions.Item label="Campus">{selectedTeam.campus.name}</Descriptions.Item>
                  <Descriptions.Item label="Quantity of member">{selectedTeam.memberCount}/{selectedTeam.memberMax}</Descriptions.Item>
                  <Descriptions.Item label="Create Date">{new Date(selectedTeam.createAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>

                <Divider>Member list</Divider>
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

                <Divider>Request members</Divider>
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
  );
}

export default Group;

