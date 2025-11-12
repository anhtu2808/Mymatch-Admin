import React, { useEffect, useState } from 'react'
import {
  Button, Card, Flex, message, Select, Table, Typography, Space, Modal,
  Descriptions, Spin, Popconfirm, Input, Form
} from 'antd'
import {
  getLecturersAPI, deleteLecturerAPI, getLecturerDetailAPI,
  createLecturerAPI, updateLecturerAPI,
  getCampusesAPI
} from '../../apis'
import { EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select;
const { TextArea } = Input;

const LecturerPage = () => {
  const [lecturerList, setLecturerList] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const [campusList, setCampusList] = useState([])
  const [loadingCampuses, setLoadingCampuses] = useState(false)

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const [requestParams, setRequestParams] = useState({
    page: 1,
    size: 10,
    sortBy: 'id',
    sortOrder: 'DESC',
    name: null,
    code: null,
    campusId: null
  })

  const fetchCampuses = async () => {
    setLoadingCampuses(true);
    try {
      const response = await getCampusesAPI({ page: 1, size: 1000, sort: 'id' });
      if (response && response.result) {
        setCampusList(response.result.data || []);
      } else {
        message.error("Could not load campus list");
      }
    } catch (error) {
      message.error("Failed to fetch campuses: " + error.message);
    } finally {
      setLoadingCampuses(false);
    }
  }

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchLecturers = async () => {
    try {
      setLoading(true)
      const apiParams = {
        ...requestParams,
        name: requestParams.name || undefined,
        code: requestParams.code || undefined,
        campusId: requestParams.campusId || undefined,
      }
      const response = await getLecturersAPI(apiParams)

      if (response && response.result) {
        setLecturerList(response.result.data || [])
        setTotal(response.result.totalElements || 0)
      } else {
        setLecturerList(response.result || [])
        setTotal(response.result?.length || 0)
      }
    } catch (error) {
      message.error('Failed to fetch lecturers: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }


  const handleSearch = () => {
    setRequestParams(prev => ({ ...prev, page: 1 }));
  }

  const handleReset = () => {
    setRequestParams({
      page: 1,
      size: 10,
      sortBy: 'id',
      sortOrder: 'DESC',
      name: null,
      code: null,
      campusId: null
    })
  }
  useEffect(() => {
    fetchLecturers();
  }, [requestParams]);


  const handleDelete = async (id) => {
    try {
      await deleteLecturerAPI(id)
      message.success('Lecturer deleted successfully')
      fetchLecturers()
    } catch (error) {
      message.error('Failed to delete lecturer: ' + error.message)
    }
  }

  const handleViewDetail = async (lecturer) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalVisible(true);
      const response = await getLecturerDetailAPI(lecturer.id);

      if (response && response.result) {
        setSelectedLecturer(response.result);
      } else {
        message.error("Invalid response structure for detail")
      }
    } catch (error) {
      message.error('Failed to fetch lecturer details: ' + error.message);
      setIsDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedLecturer(null);
  };

  const onDeleteInModal = async () => {
    if (selectedLecturer) {
      await handleDelete(selectedLecturer.id);
      handleCloseDetailModal();
    }
  };

  const handleOpenCreateModal = () => {
    setEditingLecturer(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingLecturer(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      campusId: record.campusId,
      bio: record.bio
    });
    setIsFormModalVisible(true);
  };

  const handleFormModalCancel = () => {
    setIsFormModalVisible(false);
    setEditingLecturer(null);
    form.resetFields();
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      const payload = {
        name: values.name,
        code: values.code,
        bio: values.bio,
        campusId: values.campusId
      }

      if (editingLecturer && editingLecturer.id) {
        await updateLecturerAPI(editingLecturer.id, payload);
        message.success('Lecturer updated successfully');
      } else {
        await createLecturerAPI(payload);
        message.success('Lecturer created successfully');
      }

      handleFormModalCancel();
      fetchLecturers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      message.error('Failed to save lecturer: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: true
    },
    {
      title: 'Campus',
      dataIndex: ['campus', 'id'],
      key: 'campusId',
      width: 150,
      sorter: true,
      render: (campusId) => {
        const campus = campusList.find(c => c.id === campusId);
        return campus ? campus.name : (campusId ? `ID: ${campusId}` : 'N/A');
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
            title="View Details"
            icon={<EyeOutlined style={{ color: 'black' }} />}
          >
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleOpenEditModal(record)}
            title="Edit Lecturer"
            icon={<EditOutlined style={{ color: 'black' }} />}
          >
          </Button>
          <Popconfirm
            title="Delete Lecturer"
            description="Are you sure you want to delete this lecturer?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              size="small"
              title="Delete Lecturer"
              icon={<DeleteOutlined />}
            >
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 150,
      fixed: 'right'
    }
  ]

  return (
    <div>
      <Title level={3}>Lecturer Management</Title>

      <Card style={{ marginBottom: 16 }}>
        <Flex horizontal gap="middle" align="center" wrap justify="space-between">
          <Flex horizontal gap="middle" align="center" wrap>
            <Input
              placeholder="Search by name"
              value={requestParams.name}
              onChange={(e) => setRequestParams(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: 200 }}
              allowClear
            />
            <Input
              placeholder="Search by code"
              value={requestParams.code}
              onChange={(e) => setRequestParams(prev => ({ ...prev, code: e.target.value }))}
              style={{ width: 150 }}
              allowClear
            />
            <Select
              placeholder="Filter by Campus"
              value={requestParams.campusId}
              onChange={(value) => setRequestParams(prev => ({ ...prev, campusId: value }))}
              loading={loadingCampuses}
              style={{ width: 200 }}
              allowClear
            >
              {campusList.map(campus => (
                <Option value={campus.id} key={campus.id}>
                  {campus.name}
                </Option>
              ))}
            </Select>

            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button onClick={handleReset}>
              Reset Filter
            </Button>
          </Flex>

          <Button type="primary" onClick={handleOpenCreateModal}>
            Create New Lecturer
          </Button>
        </Flex>
      </Card>

      <Table
        dataSource={lecturerList}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: requestParams.page,
          pageSize: requestParams.size,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} lecturers`,
        }}
        onChange={(pagination, filters, sorter) => {
          setRequestParams(prev => ({
            ...prev,
            page: pagination.current,
            size: pagination.pageSize,
            sortBy: sorter.field || 'id',
            sortOrder: sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : 'DESC'
          }));
        }}
        size="middle"
        bordered={false}
        scroll={{ x: 800 }}
      />

      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Lecturer Details</Title>}
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={
          <Flex justify="space-between" align="center">
            <div>
              <Popconfirm
                key="delete"
                title="Delete Lecturer"
                description="Are you sure you want to delete this lecturer?"
                onConfirm={onDeleteInModal}
                okText="Yes"
                cancelText="No"
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
        width={600}
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : selectedLecturer ? (
          <div>
            <Descriptions title="Lecturer Information" bordered column={1}>
              <Descriptions.Item label="Lecturer ID">{selectedLecturer.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedLecturer.name}</Descriptions.Item>
              <Descriptions.Item label="Code">{selectedLecturer.code}</Descriptions.Item>
              <Descriptions.Item label="Campus">{selectedLecturer.campus?.name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Bio">{selectedLecturer.bio || <i>(No bio)</i>}</Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <p>No details available.</p>
        )}
      </Modal>
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>{editingLecturer ? 'Edit Lecturer' : 'Create New Lecturer'}</Title>}
        open={isFormModalVisible}
        onCancel={handleFormModalCancel}
        footer={[
          <Button key="back" onClick={handleFormModalCancel} disabled={isSubmitting}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={isSubmitting} onClick={handleFormSubmit}>
            {editingLecturer ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" name="lecturer_form">
          <Form.Item
            name="name"
            label="Lecturer Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input placeholder="E.g., Nguyen Van A" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Lecturer Code"
            rules={[{ required: true, message: 'Please input the code!' }]}
          >
            <Input placeholder="E.g., NVA123" />
          </Form.Item>
          <Form.Item
            name="campusId"
            label="Campus"
            rules={[{ required: true, message: 'Please select a campus!' }]}
          >
            <Select
              placeholder="Select a campus"
              loading={loadingCampuses}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {campusList.map(campus => (
                <Option value={campus.id} key={campus.id}>
                  {campus.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="bio"
            label="Biography"
            rules={[{ required: false }]}
          >
            <TextArea rows={4} placeholder="Brief biography or description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LecturerPage