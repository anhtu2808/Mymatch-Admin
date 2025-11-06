import React, { useEffect, useState } from 'react'
import {
    Button, Card, Flex, message, Select, Table, Typography, Tag, Space, Modal,
    Descriptions, Spin, Popconfirm, Input, Form
} from 'antd'
import {
    getReviewCriteriaAPI, deleteReviewCriteriaAPI, getReviewCriteriaDetailAPI,
    createReviewCriteriaAPI, updateReviewCriteriaAPI
} from '../../apis'
import { EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Title } = Typography
const { TextArea } = Input

const ReviewCriterialPage = () => {
    const [criteriaList, setCriteriaList] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCriteria, setSelectedCriteria] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [editingCriteria, setEditingCriteria] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [requestParams, setRequestParams] = useState({
        page: 1,
        size: 10,
        sortBy: 'id',
        sortOrder: 'DESC',
        name: '',
        type: null
    })

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
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            sorter: true,
            render: (type) => {
                let color = 'default';
                if (type === 'mark') color = 'blue';
                if (type === 'yes_no') color = 'green';
                if (type === 'comment') color = 'orange';
                return <Tag color={color}>{type?.toUpperCase()}</Tag>;
            },
            width: 120
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDetail(record)}
                        title="View Details"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleOpenEditModal(record)}
                        title="Edit Criteria"
                    />
                    <Popconfirm
                        title="Delete Criteria"
                        description="Are you sure you want to delete this criteria? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            style={{ color: '#ff4d4f' }}
                            title="Delete Criteria"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
            fixed: 'right'
        }
    ]

    const fetchCriteria = async () => {
        try {
            setLoading(true)
            const apiParams = {
                ...requestParams,
                name: requestParams.name || undefined,
                type: requestParams.type || undefined,
            }
            const response = await getReviewCriteriaAPI(apiParams)
            setCriteriaList(response.result || [])
            setTotal(response.result?.length || 0)
        } catch (error) {
            message.error('Failed to fetch criteria: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setRequestParams(prev => ({ ...prev, page: 1 }))
        fetchCriteria()
    }

    const handleReset = () => {
        setRequestParams({
            page: 1,
            size: 10,
            sortBy: 'id',
            sortOrder: 'DESC',
            name: '',
            type: null
        })
    }

    const handleDelete = async (id) => {
        try {
            await deleteReviewCriteriaAPI(id)
            message.success('Criteria deleted successfully')
            fetchCriteria()
        } catch (error) {
            message.error('Failed to delete criteria: ' + error.message)
        }
    }

    const handleViewDetail = async (criteria) => {
        try {
            setLoadingDetail(true);
            setIsDetailModalVisible(true);
            const response = await getReviewCriteriaDetailAPI(criteria.id);
            setSelectedCriteria(response.result);
        } catch (error) {
            message.error('Failed to fetch criteria details: ' + error.message);
            setIsDetailModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedCriteria(null);
    };

    const onDeleteInModal = async () => {
        if (selectedCriteria) {
            await handleDelete(selectedCriteria.id);
            handleCloseDetailModal();
        }
    };

    const handleOpenCreateModal = () => {
        setEditingCriteria(null);
        form.resetFields();
        setIsFormModalVisible(true);
    };

    const handleOpenEditModal = (record) => {
        setEditingCriteria(record);
        form.setFieldsValue(record);
        setIsFormModalVisible(true);
    };

    const handleFormModalCancel = () => {
        setIsFormModalVisible(false);
        setEditingCriteria(null);
        form.resetFields();
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            if (editingCriteria && editingCriteria.id) {
                await updateReviewCriteriaAPI(editingCriteria.id, values);
                message.success('Criteria updated successfully');
            } else {
                await createReviewCriteriaAPI(values);
                message.success('Criteria created successfully');
            }

            handleFormModalCancel();
            fetchCriteria();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            message.error('Failed to save criteria: ' + errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchCriteria()
    }, [])

    useEffect(() => {
        fetchCriteria()
    }, [requestParams.page, requestParams.size, requestParams.sortBy, requestParams.sortOrder])

    return (
        <div>
            <Title level={3}>Review Criteria Management</Title>

            <Card>
                <Flex horizontal gap="middle" align="center" wrap justify="space-between">
                    <Flex horizontal gap="middle" align="center" wrap>
                        <Input
                            placeholder="Search by name"
                            value={requestParams.name}
                            onChange={(e) => setRequestParams({ ...requestParams, name: e.target.value })}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Select
                            placeholder="Select Type"
                            style={{ width: 180 }}
                            value={requestParams.type}
                            onChange={(value) => setRequestParams({ ...requestParams, type: value })}
                            allowClear
                        >
                            <Select.Option value="mark">Rating (Mark)</Select.Option>
                            <Select.Option value="yes_no">Yes/No</Select.Option>
                            <Select.Option value="comment">Comment</Select.Option>
                        </Select>
                        <Button type="primary" onClick={handleSearch}>
                            Search Criteria
                        </Button>
                        <Button onClick={handleReset}>
                            Reset
                        </Button>
                    </Flex>

                    <Button type="primary" onClick={handleOpenCreateModal}>
                        Create New Criteria
                    </Button>
                </Flex>
            </Card>

            <Table
                dataSource={criteriaList}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: requestParams.page,
                    pageSize: requestParams.size,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} criteria`,
                    onChange: (page, size) => {
                        const newParams = { ...requestParams, page, size }
                        setRequestParams(newParams)
                    },
                    onShowSizeChange: (current, size) => {
                        const newParams = { ...requestParams, page: 1, size }
                        setRequestParams(newParams)
                    }
                }}
                onChange={(pagination, filters, sorter) => {
                    if (sorter && sorter.field) {
                        const newParams = {
                            ...requestParams,
                            sortBy: sorter.field,
                            sortOrder: sorter.order === 'ascend' ? 'ASC' : 'DESC'
                        }
                        setRequestParams(newParams)
                    }
                }}
                size="middle"
                bordered={false}
            />

            <Modal
                title={<Title level={3} style={{ margin: 0 }}>Criteria Details</Title>}
                open={isDetailModalVisible}
                onCancel={handleCloseDetailModal}
                footer={
                    <Flex justify="space-between" align="center">
                        <div>
                            <Popconfirm
                                key="delete"
                                title="Delete Criteria"
                                description="Are you sure you want to delete this criteria?"
                                onConfirm={onDeleteInModal}
                                okText="Yes"
                                cancelText="No"
                                placement="topRight"
                            >
                                <Button danger>
                                    Delete
                                </Button>
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
                ) : selectedCriteria ? (
                    <div>
                        <Descriptions title="Criteria Information" bordered column={1}>
                            <Descriptions.Item label="Criteria ID">{selectedCriteria.id}</Descriptions.Item>
                            <Descriptions.Item label="Name">{selectedCriteria.name}</Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <Tag color={
                                    selectedCriteria.type === 'mark' ? 'blue' :
                                        selectedCriteria.type === 'yes_no' ? 'green' :
                                            selectedCriteria.type === 'comment' ? 'orange' : 'default'
                                }>
                                    {selectedCriteria.type?.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Description">{selectedCriteria.description || <i>(No description)</i>}</Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <p>No details available.</p>
                )}
            </Modal>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>{editingCriteria ? 'Edit Criteria' : 'Create New Criteria'}</Title>}
                open={isFormModalVisible}
                onCancel={handleFormModalCancel}
                footer={[
                    <Button key="back" onClick={handleFormModalCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" loading={isSubmitting} onClick={handleFormSubmit}>
                        {editingCriteria ? 'Update' : 'Create'}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" name="criteria_form">
                    <Form.Item
                        name="name"
                        label="Criteria Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input placeholder="E.g., Giảng dạy dễ hiểu" />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Criteria Type"
                        rules={[{ required: true, message: 'Please select a type!' }]}
                    >
                        <Select placeholder="Select a type">
                            <Select.Option value="mark">Rating (Mark)</Select.Option>
                            <Select.Option value="yes_no">Yes/No</Select.Option>
                            <Select.Option value="comment">Comment</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: false }]}
                    >
                        <TextArea rows={4} placeholder="Optional description for this criteria" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default ReviewCriterialPage