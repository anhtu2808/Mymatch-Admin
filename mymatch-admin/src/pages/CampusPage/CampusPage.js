import React, { useEffect, useState } from 'react'
import {
    Button, Card, Flex, message, Select, Table, Typography, Tag, Space, Modal,
    Descriptions, Spin, Popconfirm, Input, Form, Image, InputNumber
} from 'antd'
import {
    getCampusesAPI, deleteCampusAPI, getCampusDetailAPI,
    createCampusAPI, updateCampusAPI, getAllUniversitiesAPI
} from '../../apis'
import { EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select

const CampusPage = () => {
    const [campusList, setCampusList] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    const [universityList, setUniversityList] = useState([])
    const [loadingUniversities, setLoadingUniversities] = useState(false)

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [editingCampus, setEditingCampus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [requestParams, setRequestParams] = useState({
        page: 1,
        size: 10,
        sort: 'id',
        universityId: null
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
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            sorter: true
        },
        {
            title: 'Image',
            dataIndex: 'imgUrl',
            key: 'imgUrl',
            render: (imgUrl) => (
                imgUrl ? <Image width={80} src={imgUrl} alt="campus" /> : <i>(No image)</i>
            ),
            width: 120
        },
        {
            title: 'University',
            dataIndex: ['university', 'name'],
            key: 'university',
            sorter: false,
            width: 150
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
                        title="Edit Campus"
                    />
                    <Popconfirm
                        title="Delete Campus"
                        description="Are you sure you want to delete this campus? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            style={{ color: '#ff4d4f' }}
                            title="Delete Campus"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
            fixed: 'right'
        }
    ]

    const fetchUniversities = async () => {
        setLoadingUniversities(true);
        try {
            const response = await getAllUniversitiesAPI({ page: 1, size: 1000 });
            if (response && response.result) {
                setUniversityList(response.result.data || []);
            } else {
                message.error("Could not load universities list");
            }
        } catch (error) {
            message.error("Failed to fetch universities: " + error.message);
        } finally {
            setLoadingUniversities(false);
        }
    }

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchCampuses = async () => {
        try {
            setLoading(true)
            const apiParams = {
                page: requestParams.page,
                size: requestParams.size,
                sort: requestParams.sort,
                universityId: requestParams.universityId || undefined,
            }

            const response = await getCampusesAPI(apiParams)

            if (response && response.result) {
                setCampusList(response.result.data || [])
                setTotal(response.result.totalElements || 0)
            } else {
                message.error("Invalid response structure")
                setCampusList([])
                setTotal(0)
            }
        } catch (error) {
            message.error('Failed to fetch campuses: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCampuses()
    }, [requestParams])

    const handleReset = () => {
        setRequestParams({
            page: 1,
            size: 10,
            sort: 'id',
            universityId: null
        })
    }



    const handleDelete = async (id) => {
        try {
            await deleteCampusAPI(id)
            message.success('Campus deleted successfully')
            fetchCampuses()
        } catch (error) {
            message.error('Failed to delete campus: ' + error.message)
        }
    }

    const handleViewDetail = async (campus) => {
        try {
            setLoadingDetail(true);
            setIsDetailModalVisible(true);
            const response = await getCampusDetailAPI(campus.id);
            if (response && response.result) {
                setSelectedCampus(response.result);
            } else {
                message.error("Invalid response structure for detail")
            }
        } catch (error) {
            message.error('Failed to fetch campus details: ' + error.message);
            setIsDetailModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedCampus(null);
    };

    const onDeleteInModal = async () => {
        if (selectedCampus) {
            await handleDelete(selectedCampus.id);
            handleCloseDetailModal();
        }
    };

    const handleOpenCreateModal = () => {
        setEditingCampus(null);
        form.resetFields();
        setIsFormModalVisible(true);
    };

    const handleOpenEditModal = (record) => {
        setEditingCampus(record);
        const formValues = {
            ...record,
            universityId: record.university?.id
        };
        form.setFieldsValue(formValues);

        setIsFormModalVisible(true);
    };

    const handleFormModalCancel = () => {
        setIsFormModalVisible(false);
        setEditingCampus(null);
        form.resetFields();
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);
            const payload = {
                name: values.name,
                address: values.address,
                imgUrl: values.imgUrl,
                universityId: values.universityId
            }

            if (editingCampus && editingCampus.id) {
                await updateCampusAPI(editingCampus.id, payload);
                message.success('Campus updated successfully');
            } else {
                await createCampusAPI(payload);
                message.success('Campus created successfully');
            }

            handleFormModalCancel();
            fetchCampuses();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            message.error('Failed to save campus: ' + errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Title level={3}>Campus Management</Title>

            <Card style={{ marginBottom: 16 }}>
                <Flex horizontal gap="middle" align="center" wrap justify="space-between">
                    <Flex horizontal gap="middle" align="center" wrap>
                        <Select
                            placeholder="Filter by University"
                            value={requestParams.universityId}
                            onChange={(value) => setRequestParams(prev => ({ ...prev, universityId: value, page: 1 }))}
                            loading={loadingUniversities}
                            style={{ width: 250 }}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {universityList.map(uni => (
                                <Option value={uni.id} key={uni.id}>
                                    {uni.name}
                                </Option>
                            ))}
                        </Select>

                        <Button onClick={handleReset}>
                            Reset Filter
                        </Button>
                    </Flex>

                    <Button type="primary" onClick={handleOpenCreateModal}>
                        Create New Campus
                    </Button>
                </Flex>
            </Card>

            <Table
                dataSource={campusList}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: requestParams.page,
                    pageSize: requestParams.size,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} campuses`,
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
                title={<Title level={3} style={{ margin: 0 }}>Campus Details</Title>}
                open={isDetailModalVisible}
                onCancel={handleCloseDetailModal}
                footer={
                    <Flex justify="space-between" align="center">
                        <div>
                            <Popconfirm
                                key="delete"
                                title="Delete Campus"
                                description="Are you sure you want to delete this campus?"
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
                ) : selectedCampus ? (
                    <div>
                        <Descriptions title="Campus Information" bordered column={1}>
                            <Descriptions.Item label="Campus ID">{selectedCampus.id}</Descriptions.Item>
                            <Descriptions.Item label="Name">{selectedCampus.name}</Descriptions.Item>
                            <Descriptions.Item label="Address">{selectedCampus.address}</Descriptions.Item>
                            <Descriptions.Item label="University">
                                {selectedCampus.university?.name} (ID: {selectedCampus.university?.id})
                            </Descriptions.Item>
                            <Descriptions.Item label="Image">
                                {selectedCampus.imgUrl ?
                                    <Image src={selectedCampus.imgUrl} width={200} alt="campus" /> :
                                    <i>(No image provided)</i>}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <p>No details available.</p>
                )}
            </Modal>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>{editingCampus ? 'Edit Campus' : 'Create New Campus'}</Title>}
                open={isFormModalVisible}
                onCancel={handleFormModalCancel}
                footer={[
                    <Button key="back" onClick={handleFormModalCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" loading={isSubmitting} onClick={handleFormSubmit}>
                        {editingCampus ? 'Update' : 'Create'}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" name="campus_form">
                    <Form.Item
                        name="name"
                        label="Campus Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input placeholder="E.g., FPT University HCMC" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please input the address!' }]}
                    >
                        <Input placeholder="E.g., Lô E2a-7, Đường D1, Khu Công nghệ cao,..." />
                    </Form.Item>
                    <Form.Item
                        name="imgUrl"
                        label="Image URL"
                        rules={[{ required: false, type: 'url', message: 'Please enter a valid URL!' }]}
                    >
                        <Input placeholder="https://example.com/image.png" />
                    </Form.Item>

                    <Form.Item
                        name="universityId"
                        label="University"
                        rules={[{ required: true, message: 'Please select a university!' }]}
                    >
                        <Select
                            placeholder="Select a university"
                            loading={loadingUniversities}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {universityList.map(uni => (
                                <Option value={uni.id} key={uni.id}>
                                    {uni.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CampusPage