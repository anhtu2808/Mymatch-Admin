import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, message, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../utils/api';

const { Option } = Select;
const { confirm } = Modal;

const SwapClassPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    studentName: '',
    courseName: '',
    status: '',
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await api.get(`/swap-requests?page=${page}&size=${size}`);
      const result = response.data;
      if (result.code === 200) {
        setData(result.result.data);
        setPagination({
            current: response.currentPage,
            pageSize: response.pageSize,
            total: response.totalElements,
        });
        } else {
        message.error('Failed to fetch data');
        }
    } catch (error) {
      message.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      studentName: '',
      courseName: '',
      status: '',
    });
    fetchData(1, pagination.pageSize);
  };

  const handleViewDetail = async (record) => {
  setLoading(true); // show loading khi fetch chi tiết
  try {
    const response = await api.get(`/swap-requests/${record.id}`);
    const result = response.data;
    if (result.code === 200) { // code 0 là thành công theo response mẫu
      setSelectedRecord(result.result);
      setDetailVisible(true);
    } else {
      message.error('Failed to fetch swap request detail');
    }
  } catch (error) {
    message.error('Error fetching swap request detail: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = (record) => {
    confirm({
      title: 'Are you sure you want to delete this swap request?',
      icon: <ExclamationCircleOutlined />,
      content: `Student: ${record.student.user.firstName} ${record.student.user.lastName}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Implement delete logic here
        message.success('Swap request deleted successfully');
        fetchData(pagination.current, pagination.pageSize);
      },
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      COMPLETED: { color: 'green', text: 'Completed' },
      PENDING: { color: 'yellow', text: 'Pending' },
      REJECTED: { color: 'red', text: 'Rejected' },
      CANCELLED: { color: 'red', text: 'Cancelled' },
      SENT: { color: 'blue', text: 'Sent' },
      EXPIRED: { color: 'purple', text: 'Expired' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getDayTags = (days) => {
    const dayColors = {
        MONDAY: 'blue',
        TUESDAY: 'green',
        WEDNESDAY: 'purple',
        THURSDAY: 'orange',
        FRIDAY: 'red',
        SATURDAY: 'cyan',
        SUNDAY: 'magenta',
    };
    return days.map(day => (
      <Tag key={day} color={dayColors[day] || 'default'}>
        {day}
      </Tag>
    ));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 40,
      sorter: true,
    },
    {
      title: 'Student',
      key: 'student',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.student.user.firstName} {record.student.user.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {record.student.studentCode}
          </div>
        </div>
      ),
    },
    {
      title: 'Course',
      dataIndex: ['course', 'name'],
      key: 'course',
      width: 100,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.course.code}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{text}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Visibility',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 100,
      render: (visibility) => (
        <Tag color={visibility === 'PUBLIC' ? 'blue' : 'default'}>
          {visibility}
        </Tag>
      ),
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
            onClick={() => handleViewDetail(record)}
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
    <div style={{ padding: '24px', background: '#fff' }}>
      <h2 style={{ marginBottom: '24px' }}>Swap Request Management</h2>

      <Space style={{ marginBottom: 16 }} size="middle">
        <Input
          placeholder="Search by student name"
          value={filters.studentName}
          onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Input
          placeholder="Search by course"
          value={filters.courseName}
          onChange={(e) => setFilters({ ...filters, courseName: e.target.value })}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Select Status"
          value={filters.status || undefined}
          onChange={(value) => setFilters({ ...filters, status: value })}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="COMPLETED">Completed</Option>
          <Option value="PENDING">Pending</Option>
          <Option value="REJECTED">Rejected</Option>
          <Option value="CANCELLED">Cancelled</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Search
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Reset
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false, // ẩn select pageSize để giữ cố định 10 bản ghi
        }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
        bordered
      />

      <Modal
        title="Swap Request Details"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Request ID" span={2}>
                {selectedRecord.id}
              </Descriptions.Item>
              <Descriptions.Item label="Student Name" span={2}>
                {selectedRecord.student.user.firstName} {selectedRecord.student.user.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Student Code">
                {selectedRecord.student.studentCode}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedRecord.student.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedRecord.student.user.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Major">
                {selectedRecord.student.major}
              </Descriptions.Item>
              <Descriptions.Item label="Coin">
                {selectedRecord.student.user.wallet?.coin ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Campus">
                {selectedRecord.student.campus?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Visibility">
                <Tag color={selectedRecord.visibility === 'PUBLIC' ? 'blue' : 'default'}>
                  {selectedRecord.visibility}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Course Information</Divider>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Course Code">
                {selectedRecord.course.code}
              </Descriptions.Item>
              <Descriptions.Item label="Course Name">
                {selectedRecord.course.name}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Class Change Details</Divider>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="From Class">
                {selectedRecord.fromClass}
              </Descriptions.Item>
              <Descriptions.Item label="To Class">
                {selectedRecord.targetClass}
              </Descriptions.Item>
              <Descriptions.Item label="From Days">
                {getDayTags(selectedRecord.fromDays)}
              </Descriptions.Item>
              <Descriptions.Item label="To Days">
                {getDayTags(selectedRecord.toDays)}
              </Descriptions.Item>
              <Descriptions.Item label="From Slot">
                {selectedRecord.slotFrom.replace('SLOT_', 'Slot ')}
              </Descriptions.Item>
              <Descriptions.Item label="To Slot">
                {selectedRecord.slotTo.replace('SLOT_', 'Slot ')}
              </Descriptions.Item>
              <Descriptions.Item label="From Lecturer">
                {selectedRecord.lecturerFrom.name} ({selectedRecord.lecturerFrom.code})
              </Descriptions.Item>
              <Descriptions.Item label="To Lecturer">
                {selectedRecord.lecturerTo.name} ({selectedRecord.lecturerTo.code})
              </Descriptions.Item>
            </Descriptions>

            <Divider>Additional Information</Divider>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Reason">
                {selectedRecord.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(selectedRecord.createAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(selectedRecord.updateAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Expires At">
                {new Date(selectedRecord.expiresAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SwapClassPage;