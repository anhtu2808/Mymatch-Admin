import React, { useEffect, useState } from 'react'
import { Button, Card, DatePicker, Flex, message, Select, Table, Typography, Tag, Space } from 'antd'
import dayjs from 'dayjs'
import './ReviewPage.css'
import { getReviewsAPI, verifyReviewAPI, unverifyReviewAPI, deleteReviewAPI, getLecturersAPI } from '../../apis'
import { EyeOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

const ReviewPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [lecturers, setLecturers] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [semesters, setSemesters] = useState([])
  
  const [requestParams, setRequestParams] = useState({
    page: 1,
    size: 10,
    sortBy: 'id',
    sortOrder: 'DESC',
    lecturerId: null,
    courseId: null,
    studentId: null,
    semesterId: null,
    isVerified: null,
    isAnonymous: null,
    fromDate: '',
    toDate: ''
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
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'studentName',
      render: (_, record) => {
        if (record.isAnonymous) {
          return <Tag color="orange">Anonymous</Tag>
        }
        if (record.student && record.student.user) {
          return `${record.student.user.firstName || ''} ${record.student.user.lastName || ''}`.trim() || 'N/A'
        }
        return record.studentName || 'N/A'
      },
      width: 120
    },
    {
      title: 'Lecturer',
      dataIndex: ['lecturer', 'name'],
      key: 'lecturerName',
      render: (lecturerName, record) => lecturerName || record.lecturerName || 'N/A',
      width: 120
    },
    {
      title: 'Course',
      dataIndex: ['course', 'name'],
      key: 'courseName',
      render: (courseName, record) => courseName || record.courseName || 'N/A',
      width: 150
    },
    {
      title: 'Semester',
      dataIndex: ['semester', 'name'],
      key: 'semesterName',
      render: (semesterName, record) => semesterName || record.semesterName || 'N/A',
      width: 100
    },
    {
      title: 'Anonymous',
      dataIndex: 'isAnonymous',
      key: 'isAnonymous',
      render: (isAnonymous) => (
        <Tag color={isAnonymous ? 'orange' : 'blue'}>
          {isAnonymous ? 'Yes' : 'No'}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified) => (
        <Tag color={isVerified ? 'green' : 'red'}>
          {isVerified ? 'Yes' : 'No'}
        </Tag>
      ),
      width: 100
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
          {!record.isVerified ? (
            <Button 
              type="text" 
              icon={<CheckOutlined />} 
              size="small"
              onClick={() => handleVerify(record.id)}
              style={{ color: '#52c41a' }}
              title="Verify Review"
            />
          ) : (
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              size="small"
              onClick={() => handleUnverify(record.id)}
              style={{ color: '#ff4d4f' }}
              title="Unverify Review"
            />
          )}
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record.id)}
            style={{ color: '#ff4d4f' }}
            title="Delete Review"
          />
        </Space>
      ),
      width: 120,
      fixed: 'right'
    }
  ]

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const apiParams = {
        ...requestParams,
        lecturerId: requestParams.lecturerId || undefined,
        courseId: requestParams.courseId || undefined,
        studentId: requestParams.studentId || undefined,
        semesterId: requestParams.semesterId || undefined,
        isVerified: requestParams.isVerified !== null ? requestParams.isVerified : undefined,
        isAnonymous: requestParams.isAnonymous !== null ? requestParams.isAnonymous : undefined,
        fromDate: requestParams.fromDate || undefined,
        toDate: requestParams.toDate || undefined,
      }
      
      const response = await getReviewsAPI(apiParams)
      setReviews(response.result?.data || [])
      setTotal(response.result?.totalElements || 0)
    } catch (error) {
      message.error('Failed to fetch reviews: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  const fetchLecturers = async () => {
    const apiParams = {
      page: 1,
      size: 1000,
      sortBy: 'id',
      sortOrder: 'DESC'
    }
    const response = await getLecturersAPI(apiParams)
    setLecturers(response.result?.data || [])
  }


  const handleSearch = () => {
    setRequestParams(prev => ({ ...prev, page: 1 }))
    fetchReviews()
  }

  const handleReset = () => {
    setRequestParams({
      page: 1,
      size: 10,
      sortBy: 'id',
      sortOrder: 'DESC',
      lecturerId: null,
      courseId: null,
      studentId: null,
      semesterId: null,
      isVerified: null,
      isAnonymous: null,
      fromDate: '',
      toDate: ''
    })
  }

  const handleVerify = async (id) => {
    try {
      await verifyReviewAPI(id)
      message.success('Review verified successfully')
      fetchReviews()
    } catch (error) {
      message.error('Failed to verify review: ' + error.message)
    }
  }

  const handleUnverify = async (id) => {
    try {
      await unverifyReviewAPI(id)
      message.success('Review unverified successfully')
      fetchReviews()
    } catch (error) {
      message.error('Failed to unverify review: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteReviewAPI(id)
      message.success('Review deleted successfully')
      fetchReviews()
    } catch (error) {
      message.error('Failed to delete review: ' + error.message)
    }
  }

  const handleViewDetail = (review) => {
    // TODO: Implement view detail modal
    console.log('View detail:', review)
  }

  useEffect(() => {
    fetchLecturers()
    fetchReviews()
  }, [requestParams.page, requestParams.size, requestParams.sortBy, requestParams.sortOrder])

  return (
    <div>
      <Title level={3}>Reviews Management</Title>

      <Card>
        <Flex horizontal gap="middle" align="center" wrap>
          <Select
            placeholder="Select Lecturer"
            className="lecturer-select"
            value={requestParams.lecturerId}
            onChange={(value) => setRequestParams({ ...requestParams, lecturerId: value })}
            allowClear
            showSearch
            filterOption={(input, option) => {
              const lecturer = lecturers.find(l => l.id === option.value)
              if (!lecturer) return false
              
              const searchText = input.toLowerCase()
              const name = (lecturer.name || '').toLowerCase()
              const code = (lecturer.code || '').toLowerCase()
              
              return name.includes(searchText) || code.includes(searchText)
            }}
          >
            {lecturers.map((lecturer) => (
              <Select.Option key={lecturer.id} value={lecturer.id}>
                {lecturer.name} ({lecturer.code})
              </Select.Option>
            ))}
          </Select>
          

          <Select
            placeholder="Select Course"
            className="course-select"
            value={requestParams.courseId}
            onChange={(value) => setRequestParams({ ...requestParams, courseId: value })}
            allowClear
            showSearch
          >
            {/* TODO: Add course options from API */}
            <Select.Option value={1}>Course 1</Select.Option>
            <Select.Option value={2}>Course 2</Select.Option>
          </Select>

          <Select
            placeholder="Select Student"
            className="student-select"
            value={requestParams.studentId}
            onChange={(value) => setRequestParams({ ...requestParams, studentId: value })}
            allowClear
            showSearch
          >
            {/* TODO: Add student options from API */}
            <Select.Option value={1}>Student 1</Select.Option>
            <Select.Option value={2}>Student 2</Select.Option>
          </Select>

          <Select
            placeholder="Select Semester"
            className="semester-select"
            value={requestParams.semesterId}
            onChange={(value) => setRequestParams({ ...requestParams, semesterId: value })}
            allowClear
          >
            {/* TODO: Add semester options from API */}
            <Select.Option value={1}>Semester 1</Select.Option>
            <Select.Option value={2}>Semester 2</Select.Option>
          </Select>

          <Select
            placeholder="Verification Status"
            className="verification-select"
            value={requestParams.isVerified}
            onChange={(value) => setRequestParams({ ...requestParams, isVerified: value })}
            allowClear
          >
            <Select.Option value={true}>Verified</Select.Option>
            <Select.Option value={false}>Pending</Select.Option>
          </Select>

          <Select
            placeholder="Anonymous Status"
            className="anonymous-select"
            value={requestParams.isAnonymous}
            onChange={(value) => setRequestParams({ ...requestParams, isAnonymous: value })}
            allowClear
          >
            <Select.Option value={true}>Anonymous</Select.Option>
            <Select.Option value={false}>Named</Select.Option>
          </Select>

          <DatePicker
            placeholder="From Date"
            value={requestParams.fromDate ? dayjs(requestParams.fromDate) : null}
            onChange={(date) => setRequestParams({
              ...requestParams,
              fromDate: date ? date.format('YYYY-MM-DD') : ''
            })}
          />

          <DatePicker
            placeholder="To Date"
            value={requestParams.toDate ? dayjs(requestParams.toDate) : null}
            onChange={(date) => setRequestParams({
              ...requestParams,
              toDate: date ? date.format('YYYY-MM-DD') : ''
            })}
          />

          <Button type="primary" onClick={handleSearch}>
            Search Reviews
          </Button>
          <Button onClick={handleReset}>
            Reset
          </Button>
        </Flex>
      </Card>

      <Table
        dataSource={reviews}
        columns={columns}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1400 }}
        pagination={{
          current: requestParams.page,
          pageSize: requestParams.size,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`,
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
    </div>
  )
}

export default ReviewPage