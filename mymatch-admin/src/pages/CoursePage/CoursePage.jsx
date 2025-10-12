import React, { useEffect, useState } from 'react'
import { Button, Card, Flex, message, Table, Typography, Space, Input, Modal, Form, Popconfirm, Select } from 'antd'
import './CoursePage.css'
import {
    getCoursesAPI,
    createCourseAPI,
    updateCourseAPI,
    deleteCourseAPI,
    getAllUniversitiesAPI,
} from '../../apis'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Search } = Input

const CoursePage = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)
    const [universities, setUniversities] = useState([])
    const [form] = Form.useForm()

    const [requestParams, setRequestParams] = useState({
        page: 1,
        size: 10,
        sortBy: 'code',
        sortOrder: 'ASC',
        name: '',
        code: '',
        universityId: null,
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: true
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            sorter: true,
            width: 150
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                        title="Edit Course"
                    />
                    <Popconfirm
                        title="Xóa môn học này"
                        description="Bạn có chắc chắn muốn xóa môn học này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            title="Delete Course"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
            fixed: 'right'
        }
    ]

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const apiParams = {
                ...requestParams,
                sort: `${requestParams.sortBy || 'code'},${requestParams.sortOrder === 'DESC' ? 'desc' : 'asc'}`
            }
            const response = await getCoursesAPI(apiParams)
            setCourses(response.result?.data || [])
            setTotal(response.result?.totalElements || 0)
        } catch (error) {
            message.error('Có lỗi khi tải danh sách môn học: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchUniversities = async () => {
        try {
            const response = await getAllUniversitiesAPI();
            setUniversities(response.result?.data || []);
        } catch (error) {
            message.error("Failed to fetch universities!");
        }
    }

    const handleSearch = () => {
        setRequestParams((prev) => ({ ...prev, page: 1 }))
        fetchCourses()
    }

    const handleReset = () => {
        setRequestParams({
            page: 1,
            size: 10,
            sortBy: 'code',
            sortOrder: 'ASC',
            name: '',
            code: '',
            universityId: null,
        });
    };

    const handleCreate = () => {
        setEditingCourse(null)
        form.resetFields()
        setIsModalVisible(true)
    }

    const handleEdit = (course) => {
        setEditingCourse(course)
        form.setFieldsValue({
            ...course,
            universityId: course.university?.id || course.universityId
        });
        setIsModalVisible(true);
    }

    const handleDelete = async (id) => {
        try {
            await deleteCourseAPI(id)
            message.success('Môn học được xóa thành công')
            fetchCourses()
        } catch (error) {
            message.error('Đã có lỗi xảy ra khi xóa môn học: ' + error.message)
        }
    }

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields()
            if (editingCourse) {
                await updateCourseAPI(editingCourse.id, values)
                message.success('Cập nhật môn học thành công')
            } else {
                await createCourseAPI(values)
                message.success('Đã có lỗi xảy ra khi cập nhật môn học')
            }
            setIsModalVisible(false)
            fetchCourses()
        } catch (error) {
            if (error.response?.data?.message?.includes('Duplicate entry')) {
                message.error('Mã môn học này đã tồn tại trong trường đại học đã chọn. Vui lòng thử lại!');
            } else {
                message.error('Lưu môn học thất bại: ' + error.message);
            }
        }
    }

    const handleModalCancel = () => {
        setIsModalVisible(false)
    }

    useEffect(() => {
        fetchCourses();
        fetchUniversities();
    }, [requestParams.page, requestParams.size, requestParams.sortBy, requestParams.sortOrder]);

    return (
        <div className="course-page">
            <Flex justify="space-between" align="center">
                <Title level={3}>Courses Management</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Create Course
                </Button>
            </Flex>

            <Card>
                <Flex vertical gap="middle">
                    <Flex horizontal gap="middle" align="center" wrap="wrap">
                        <Input
                            placeholder="Filter by Code"
                            value={requestParams.code}
                            onChange={(e) => setRequestParams({ ...requestParams, code: e.target.value })}
                            style={{ minWidth: 200 }}
                        />
                        <Input
                            placeholder="Filter by Name"
                            value={requestParams.name}
                            onChange={(e) => setRequestParams({ ...requestParams, name: e.target.value })}
                            style={{ minWidth: 200 }}
                        />
                        <Select
                            placeholder="Filter by University"
                            value={requestParams.universityId}
                            onChange={(value) => setRequestParams({ ...requestParams, universityId: value })}
                            style={{ minWidth: 200 }}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={universities.map(uni => ({
                                value: uni.id,
                                label: uni.name
                            }))}
                        />
                        <Button type="primary" onClick={handleSearch}>
                            Search
                        </Button>
                        <Button onClick={handleReset}>
                            Reset
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            <Table
                dataSource={courses}
                columns={columns}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1000 }}
                pagination={{
                    current: requestParams.page,
                    pageSize: requestParams.size,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} courses`,
                    onChange: (page, size) => {
                        setRequestParams({ ...requestParams, page, size })
                    },
                }}
                onChange={(pagination, filters, sorter) => {
                    if (sorter && sorter.field) {
                        const newSort = `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
                        setRequestParams({ ...requestParams, sort: newSort })
                    }
                }}
                size="middle"
                bordered={false}
            />

            <Modal
                title={editingCourse ? 'Edit Course' : 'Create New Course'}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Save"
                cancelText="Cancel"
            >
                <Form form={form} layout="vertical" name="course_form">
                    <Form.Item
                        name="code"
                        label="Course Code"
                        rules={[{ required: true, message: 'Please input the course code!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Course Name"
                        rules={[{ required: true, message: 'Please input the course name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="universityId"
                        label="University"
                        rules={[{ required: true, message: 'Please select the university!' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a university"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={universities.map(uni => ({
                                value: uni.id,
                                label: uni.name
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CoursePage