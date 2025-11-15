import React, { useEffect, useState, useCallback } from 'react'
import {
    Button, Card, Flex, message, Select, Table, Typography, Space, Modal,
    Descriptions, Spin, Popconfirm, Input, Form
} from 'antd'
import {
    getUsersAPI, getUserDetailAPI, updateUserAPI,
    banUserAPI, unbanUserAPI, getCampusesAPI, getAllUniversitiesAPI
} from '../../apis'
import { EyeOutlined, DeleteOutlined, EditOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select;
const { TextArea } = Input;

const StudentPage = () => {
    const [studentList, setStudentList] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    const [campusList, setCampusList] = useState([])
    const [loadingCampuses, setLoadingCampuses] = useState(false)

    const [universitiesList, setUniversitiesList] = useState([])
    const [loadingUniversities, setLoadingUniversities] = useState(false)

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [requestParams, setRequestParams] = useState({
        page: 1,
        size: 10,
        sortBy: 'id',
        sortOrder: 'DESC',
        username: null,
        email: null,
        campusId: null,
        universityId: null,
        deleted: 0,
        isActive: undefined,
        role: 'STUDENT'
    });

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

    const fetchUniversities = async () => {
        setLoadingUniversities(true);
        try {
            const response = await getAllUniversitiesAPI({ page: 1, size: 1000 });
            if (response && response.result) {
                setUniversitiesList(response.result.data || []);
            } else {
                message.error("Could not load university list");
            }
        } catch (error) {
            message.error("Failed to fetch universities: " + error.message);
        } finally {
            setLoadingUniversities(false);
        }
    }

    useEffect(() => {
        fetchCampuses();
        fetchUniversities();
    }, []);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true)
            const apiParams = {
                ...requestParams,
                page: requestParams.page > 0 ? requestParams.page - 1 : 0,
                username: requestParams.username || undefined,
                email: requestParams.email || undefined,
                campusId: requestParams.campusId || undefined,
                universityId: requestParams.universityId || undefined,
                deleted: requestParams.deleted,
                isActive: requestParams.isActive !== undefined ? requestParams.isActive : undefined,
                role: 'STUDENT',
                sort: requestParams.sortBy
            }

            delete apiParams.sortBy;
            delete apiParams.sortOrder;


            const response = await getUsersAPI(apiParams)

            if (response && response.result) {
                setStudentList(response.result.data || [])
                setTotal(response.result.totalElements || 0)
            } else {
                message.error("Invalid response structure for students")
                setStudentList([])
                setTotal(0)
            }
        } catch (error) {
            message.error('Failed to fetch students: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }, [requestParams])


    const handleSearch = () => {
        setRequestParams(prev => ({ ...prev, page: 1 }));
        fetchStudents();
    }

    const handleReset = () => {
        setRequestParams({
            page: 1,
            size: 10,
            sortBy: 'id',
            sortOrder: 'DESC',
            username: null,
            email: null,
            campusId: null,
            universityId: null,
            deleted: 0,
            isActive: undefined,
            role: 'STUDENT'
        })
    }

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleBan = async (id) => {
        try {
            await banUserAPI(id)
            message.success('Student banned successfully')
            fetchStudents()
        } catch (error) {
            message.error('Failed to ban student: ' + error.message)
        }
    }

    const handleUnban = async (id) => {
        try {
            await unbanUserAPI(id)
            message.success('Student unbanned successfully')
            fetchStudents()
        } catch (error) {
            message.error('Failed to unban student: ' + error.message)
        }
    }
    const handleViewDetail = async (student) => {
        try {
            setLoadingDetail(true);
            setIsDetailModalVisible(true);
            const response = await getUserDetailAPI(student.id);

            if (response && response.result) {
                setSelectedStudent(response.result);
            } else {
                message.error("Invalid response structure for detail")
            }
        } catch (error) {
            message.error('Failed to fetch student details: ' + error.message);
            setIsDetailModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedStudent(null);
    };

    const onBanInModal = async () => {
        if (selectedStudent) {
            await handleBan(selectedStudent.id);
            handleCloseDetailModal();
        }
    };

    const onUnbanInModal = async () => {
        if (selectedStudent) {
            await handleUnban(selectedStudent.id);
            handleCloseDetailModal();
        }
    };

    const handleOpenEditModal = (record) => {
        setEditingStudent(record);
        form.setFieldsValue({
            username: record.username,
            phone: record.phone,
            avatarUrl: record.avatarUrl,
            campusId: record.student?.campus?.id,
            major: record.student?.major
        });
        setIsFormModalVisible(true);
    };

    const handleFormModalCancel = () => {
        setIsFormModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);
            const payload = { ...values }

            if (editingStudent && editingStudent.id) {
                await updateUserAPI(editingStudent.id, payload);
                message.success('Student updated successfully');
            }


            handleFormModalCancel();
            fetchStudents();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            message.error('Failed to save student: ' + errorMsg);
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
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: true
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true
        },
        {
            title: 'Campus',
            dataIndex: ['student', 'campus', 'name'],
            key: 'campus',
            width: 150,
            render: (campusName) => campusName || 'N/A'
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive) => (
                isActive === true
                    ? <span style={{ color: 'green' }}>Active</span>
                    : <span style={{ color: 'red' }}>Inactive</span>
            )
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
                    />
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleOpenEditModal(record)}
                        title="Edit Student"
                        icon={<EditOutlined style={{ color: 'black' }} />}
                    />
                    {record.isActive === true ? (
                        <Popconfirm
                            title="Ban Student"
                            description="Are you sure you want to ban this student?"
                            onConfirm={() => handleBan(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                type="link"
                                danger
                                size="small"
                                title="Ban Student"
                                icon={<StopOutlined />}
                            />
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Unban Student"
                            description="Are you sure you want to unban this student?"
                            onConfirm={() => handleUnban(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                type="link"
                                size="small"
                                title="Unban Student"
                                icon={<CheckCircleOutlined style={{ color: 'green' }} />}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
            width: 150,
            fixed: 'right'
        }
    ]

    return (
        <div>
            <Title level={3}>Student Management</Title>

            <Card style={{ marginBottom: 16 }}>
                <Flex horizontal gap="middle" align="center" wrap justify="space-between">
                    <Flex horizontal gap="middle" align="center" wrap>
                        <Input
                            placeholder="Search by username"
                            value={requestParams.username}
                            onChange={(e) => setRequestParams(prev => ({ ...prev, username: e.target.value }))}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Input
                            placeholder="Search by email"
                            value={requestParams.email}
                            onChange={(e) => setRequestParams(prev => ({ ...prev, email: e.target.value }))}
                            style={{ width: 200 }}
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

                        <Select
                            placeholder="Filter by University"
                            value={requestParams.universityId}
                            onChange={(value) => setRequestParams(prev => ({ ...prev, universityId: value }))}
                            loading={loadingUniversities}
                            style={{ width: 200 }}
                            allowClear
                        >
                            {universitiesList.map(university => (
                                <Option value={university.id} key={university.id}>
                                    {university.name}
                                </Option>
                            ))}
                        </Select>

                        <Select
                            placeholder="Filter by Is Active"
                            value={requestParams.isActive}
                            onChange={(value) => setRequestParams(prev => ({ ...prev, isActive: value }))}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Option value={true}>Is Active</Option>
                            <Option value={false}>Is Inactive</Option>
                        </Select>

                        <Button type="primary" onClick={handleSearch}>
                            Search
                        </Button>
                        <Button onClick={handleReset}>
                            Reset Filter
                        </Button>
                    </Flex>


                </Flex>
            </Card>

            <Table
                dataSource={studentList}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: requestParams.page,
                    pageSize: requestParams.size,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
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
                title={<Title level={3} style={{ margin: 0 }}>Student Details</Title>}
                open={isDetailModalVisible}
                onCancel={handleCloseDetailModal}
                footer={
                    <Flex justify="space-between" align="center">
                        <div>
                            {selectedStudent && (
                                selectedStudent.isActive === true ? (
                                    <Popconfirm
                                        key="ban"
                                        title="Ban Student"
                                        description="Are you sure you want to ban this student?"
                                        onConfirm={onBanInModal}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger>Ban</Button>
                                    </Popconfirm>
                                ) : (
                                    <Popconfirm
                                        key="unban"
                                        title="Unban Student"
                                        description="Are you sure you want to unban this student?"
                                        onConfirm={onUnbanInModal}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="primary">Unban</Button>
                                    </Popconfirm>
                                )
                            )}
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
                ) : selectedStudent ? (
                    <div>
                        <Descriptions title="Student Information" bordered column={1}>
                            <Descriptions.Item label="Student ID">{selectedStudent.id}</Descriptions.Item>
                            <Descriptions.Item label="Username">{selectedStudent.username}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedStudent.email}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{selectedStudent.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Campus">{selectedStudent.student?.campus?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="University">{selectedStudent.student?.campus?.university?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Major">{selectedStudent.student?.major || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                {selectedStudent.isActive === true
                                    ? <span style={{ color: 'green' }}>Active</span>
                                    : <span style={{ color: 'red' }}>Inactive</span>
                                }
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <p>No details available.</p>
                )}
            </Modal>
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Edit Student</Title>}
                open={isFormModalVisible}
                onCancel={handleFormModalCancel}
                footer={[
                    <Button key="back" onClick={handleFormModalCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" loading={isSubmitting} onClick={handleFormSubmit}>
                        Update
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" name="student_form">
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please input the username!' }]}
                    >
                        <Input placeholder="E.g., studentA" disabled />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="E.g., +84123456789" />
                    </Form.Item>
                    <Form.Item
                        name="avatarUrl"
                        label="Avatar URL"
                        rules={[{ required: false, type: 'url', message: 'Please enter a valid URL' }]}
                    >
                        <Input placeholder="E.g., https://example.com/avatar.png" />
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
                        name="major"
                        label="Major"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="E.g., Software Engineering" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default StudentPage