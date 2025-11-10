import React, { useEffect, useState } from 'react'
import {
    Button, Card, Flex, message, Table, Typography, Space, Modal,
    Descriptions, Spin, Popconfirm, Input, Form, Image
} from 'antd'
import {
    getAllUniversitiesAPI, deleteUniversityAPI, getUniversityByIdAPI,
    createUniversityAPI, updateUniversityAPI
} from '../../apis'
import { EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Title } = Typography

const UniversityPage = () => {
    const [universityList, setUniversityList] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [requestParams, setRequestParams] = useState({
        page: 1,
        size: 10,
        sort: 'id'
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
            title: 'Image',
            dataIndex: 'imgUrl',
            key: 'imgUrl',
            render: (imgUrl) => (
                imgUrl ? <Image width={80} src={imgUrl} alt="university" /> : <i>(No image)</i>
            ),
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
                        title="Edit University"
                    />
                    <Popconfirm
                        title="Delete University"
                        description="Are you sure you want to delete this university?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            style={{ color: '#ff4d4f' }}
                            title="Delete University"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
            fixed: 'right'
        }
    ]

    const fetchUniversities = async () => {
        try {
            setLoading(true)
            const apiParams = {
                page: requestParams.page,
                size: requestParams.size,
                sort: requestParams.sort,
            }

            const response = await getAllUniversitiesAPI(apiParams)

            if (response && response.result) {
                setUniversityList(response.result.data || [])
                setTotal(response.result.totalElements || 0)
            } else {
                message.error("Invalid response structure")
                setUniversityList([])
                setTotal(0)
            }
        } catch (error) {
            message.error('Failed to fetch universities: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUniversities()
    }, [requestParams])

    const handleDelete = async (id) => {
        try {
            await deleteUniversityAPI(id)
            message.success('University deleted successfully')
            fetchUniversities()
        } catch (error) {
            message.error('Failed to delete university: ' + error.message)
        }
    }

    const handleViewDetail = async (university) => {
        try {
            setLoadingDetail(true);
            setIsDetailModalVisible(true);
            const response = await getUniversityByIdAPI(university.id);
            if (response && response.result) {
                setSelectedUniversity(response.result);
            } else {
                message.error("Invalid response structure for detail")
            }
        } catch (error) {
            message.error('Failed to fetch university details: ' + error.message);
            setIsDetailModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedUniversity(null);
    };

    const onDeleteInModal = async () => {
        if (selectedUniversity) {
            await handleDelete(selectedUniversity.id);
            handleCloseDetailModal();
        }
    };

    const handleOpenCreateModal = () => {
        setEditingUniversity(null);
        form.resetFields();
        setIsFormModalVisible(true);
    };

    const handleOpenEditModal = (record) => {
        setEditingUniversity(record);
        form.setFieldsValue(record);
        setIsFormModalVisible(true);
    };

    const handleFormModalCancel = () => {
        setIsFormModalVisible(false);
        setEditingUniversity(null);
        form.resetFields();
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);
            const payload = {
                name: values.name,
                imgUrl: values.imgUrl,
            }

            if (editingUniversity && editingUniversity.id) {
                await updateUniversityAPI(editingUniversity.id, payload);
                message.success('University updated successfully');
            } else {
                await createUniversityAPI(payload);
                message.success('University created successfully');
            }

            handleFormModalCancel();
            fetchUniversities();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            message.error('Failed to save university: ' + errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Title level={3}>University Management</Title>

            <Card style={{ marginBottom: 16 }}>
                <Flex align="center" justify="space-between">
                    <div />
                    <Button type="primary" onClick={handleOpenCreateModal}>
                        Create New University
                    </Button>
                </Flex>
            </Card>

            <Table
                dataSource={universityList}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: requestParams.page,
                    pageSize: requestParams.size,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} universities`, // Sửa text
                    onChange: (page, size) => {
                        setRequestParams(prev => ({ ...prev, page, size }))
                    },
                }}
                onChange={(pagination, filters, sorter) => {
                    if (sorter && sorter.field) {
                        const sortField = Array.isArray(sorter.field) ? sorter.field.join('.') : sorter.field;
                        const newSort = `${sortField}${sorter.order === 'descend' ? ',desc' : ',asc'}`
                        setRequestParams(prev => ({
                            ...prev,
                            sort: newSort
                        }))
                    } else {
                        setRequestParams(prev => ({
                            ...prev,
                            sort: 'id'
                        }))
                    }
                }}
                size="middle"
                bordered={false}
                scroll={{ x: 800 }}
            />

            <Modal
                title={<Title level={3} style={{ margin: 0 }}>University Details</Title>}
                open={isDetailModalVisible}
                onCancel={handleCloseDetailModal}
                footer={
                    <Flex justify="space-between" align="center">
                        <div>
                            <Popconfirm
                                key="delete"
                                title="Delete University"
                                description="Are you sure you want to delete this university?"
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
                ) : selectedUniversity ? (
                    <div>
                        <Descriptions title="University Information" bordered column={1}>
                            <Descriptions.Item label="University ID">{selectedUniversity.id}</Descriptions.Item>
                            <Descriptions.Item label="Name">{selectedUniversity.name}</Descriptions.Item>
                            <Descriptions.Item label="Image">
                                {selectedUniversity.imgUrl ?
                                    <Image src={selectedUniversity.imgUrl} width={200} alt="university" /> :
                                    <i>(No image provided)</i>}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <p>No details available.</p>
                )}
            </Modal>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>{editingUniversity ? 'Edit University' : 'Create New University'}</Title>}
                open={isFormModalVisible}
                onCancel={handleFormModalCancel}
                footer={[
                    <Button key="back" onClick={handleFormModalCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" loading={isSubmitting} onClick={handleFormSubmit}>
                        {editingUniversity ? 'Update' : 'Create'}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" name="university_form">
                    <Form.Item
                        name="name"
                        label="University Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input placeholder="E.g., FPT University" />
                    </Form.Item>
                    <Form.Item
                        name="imgUrl"
                        label="Image URL"
                        rules={[{ required: false, type: 'url', message: 'Please enter a valid URL!' }]}
                    >
                        <Input placeholder="https://example.com/image.png" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UniversityPage