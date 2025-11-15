import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Spin,
  Statistic,
  Table,
  Tabs,
  Space,
  Button,
  Tag,
  message,
  Empty
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  TransactionOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import api from '../../utils/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    universityId: null,
    campusId: null
  });
  
  const [filterOptions, setFilterOptions] = useState({
    universities: [],
    campuses: []
  });

  // Chart data states
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [transactionTrendData, setTransactionTrendData] = useState([]);
  const [swapSuccessData, setSwapSuccessData] = useState(null);

  // Table data states
  const [usersData, setUsersData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [swapsData, setSwapsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [revenueGroupBy, setRevenueGroupBy] = useState('DAY');

  // Pagination states
  const [usersPagination, setUsersPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [studentsPagination, setStudentsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [swapsPagination, setSwapsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [transactionsPagination, setTransactionsPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // --- EFFECTS ---
  useEffect(() => {
    fetchFilterOptions();
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [filters, revenueGroupBy]);

  // --- API CALLS ---

  const fetchFilterOptions = async () => {
    try {
      const uniRes = await api.get('/universities?page=1&size=999');
      let universities = [];
      if (uniRes.data.code === 200) {
        universities = uniRes.data.result.data.map(uni => ({
          id: uni.id,
          name: uni.name
        }));
      }

      const campusRes = await api.get('/campuses?page=1&size=999');
      let campuses = [];
      if (campusRes.data.code === 200) {
        campuses = campusRes.data.result.data.map(campus => ({
          id: campus.id,
          name: campus.name,
          universityId: campus.university?.id
        }));
      }

      setFilterOptions({ universities, campuses });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      message.error('Failed to load filter options');
    }
  };

  const fetchAllData = () => {
    fetchKPIs();
    fetchRevenueTrend();
    fetchUserGrowth();
    fetchTransactionTrend();
    fetchSwapSuccessRate();
    
    fetchUsersTable(1, usersPagination.pageSize);
    fetchStudentsTable(1, studentsPagination.pageSize);
    fetchSwapsTable(1, swapsPagination.pageSize);
    fetchTransactionsTable(1, transactionsPagination.pageSize);
  };

  const fetchKPIs = async () => {
    try {
      const response = await api.get('/api/dashboard/kpis', { params: filters });
      if (response.data.code === 200) {
        setKpis(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  const fetchRevenueTrend = async () => {
    try {
      // Thêm groupBy vào params
      const params = { ...filters, groupBy: revenueGroupBy };
      const response = await api.get('/api/dashboard/charts/revenue-trend', { params });
      
      if (response.data.code === 200) {
        const rawData = response.data.result;
        
        // Map dữ liệu từ API (revenue) sang format của Recharts (value)
        const chartData = rawData.map(item => {
          let formattedDate = item.date;
          // Format lại ngày hiển thị cho đẹp tùy theo groupBy
          if (item.date) {
             if (revenueGroupBy === 'YEAR') {
                formattedDate = item.date.substring(0, 4); // 2025
             } else if (revenueGroupBy === 'MONTH') {
                formattedDate = item.date.substring(0, 7); // 2025-11
             } else {
                formattedDate = item.date.split('T')[0]; // 2025-11-07
             }
          }

          return {
            date: formattedDate,
            value: item.revenue // API trả về 'revenue', Chart đang dùng 'value'
          };
        });

        setRevenueData(chartData);
      }
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
    }
  };

  const fetchTransactionTrend = async () => {
    try {
      // THAY ĐỔI: Gọi API bảng (tables) thay vì API biểu đồ (charts)
      // Lưu ý: Đặt size lớn (ví dụ 100) để lấy đủ dữ liệu cho biểu đồ vì API này có phân trang
      const params = { ...filters, page: 1, size: 100 }; 
      const response = await api.get('/api/dashboard/tables/transactions', { params });

      if (response.data.code === 200) {
        const rawData = response.data.result.data;
        
        // XỬ LÝ DỮ LIỆU: Gom nhóm theo ngày
        const groupedData = rawData.reduce((acc, item) => {
          // item.createAt có dạng "2025-11-15T07:06:13..." -> cắt lấy phần ngày "2025-11-15"
          const date = item.createAt ? item.createAt.split('T')[0] : 'N/A';
          
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += 1; // Đếm số lượng giao dịch (value = số lượng)
          return acc;
        }, {});

        // CHUYỂN ĐỔI: Sang định dạng mảng mà Recharts yêu cầu [{ date: '...', value: ... }]
        const chartData = Object.keys(groupedData).map(date => ({
          date: date,
          value: groupedData[date]
        }));

        // SẮP XẾP: Đảm bảo ngày hiển thị từ cũ đến mới
        chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTransactionTrendData(chartData);
      }
    } catch (error) {
      console.error('Error fetching transaction trend:', error);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      const response = await api.get('/api/dashboard/charts/user-growth', { params: filters });
      if (response.data.code === 200) {
        setUserGrowthData(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching user growth:', error);
    }
  };

  const fetchSwapSuccessRate = async () => {
    try {
      const response = await api.get('/api/dashboard/charts/swap-success-rate', { params: filters });
      if (response.data.code === 200) {
        setSwapSuccessData(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching swap success rate:', error);
    }
  };

  const fetchUsersTable = async (page = 1, size = 10) => {
    try {
      const params = { ...filters, page, size };
      const response = await api.get('/api/dashboard/tables/users', { params });
      if (response.data.code === 200) {
        setUsersData(response.data.result.data);
        setUsersPagination({
          current: response.data.result.currentPage,
          pageSize: response.data.result.pageSize,
          total: response.data.result.totalElements
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStudentsTable = async (page = 1, size = 10) => {
    try {
      const params = { ...filters, page, size };
      const response = await api.get('/api/dashboard/tables/students', { params });
      if (response.data.code === 200) {
        setStudentsData(response.data.result.data);
        setStudentsPagination({
          current: response.data.result.currentPage,
          pageSize: response.data.result.pageSize,
          total: response.data.result.totalElements
        });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSwapsTable = async (page = 1, size = 10) => {
    try {
      const params = { ...filters, page, size };
      const response = await api.get('/api/dashboard/tables/swaps', { params });
      if (response.data.code === 200) {
        setSwapsData(response.data.result.data);
        setSwapsPagination({
          current: response.data.result.currentPage,
          pageSize: response.data.result.pageSize,
          total: response.data.result.totalElements
        });
      }
    } catch (error) {
      console.error('Error fetching swaps:', error);
    }
  };

  const fetchTransactionsTable = async (page = 1, size = 10) => {
    try {
      const params = { ...filters, page, size };
      const response = await api.get('/api/dashboard/tables/transactions', { params });
      if (response.data.code === 200) {
        setTransactionsData(response.data.result.data);
        setTransactionsPagination({
          current: response.data.result.currentPage,
          pageSize: response.data.result.pageSize,
          total: response.data.result.totalElements
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // --- HANDLERS ---

  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      startDate: dates ? dates[0].toISOString() : null,
      endDate: dates ? dates[1].toISOString() : null
    });
  };

  const handleUniversityChange = (value) => {
    setFilters({
      ...filters,
      universityId: value,
      campusId: null
    });
  };

  const handleUsersTableChange = (newPagination) => {
    fetchUsersTable(newPagination.current, newPagination.pageSize);
  };
  const handleStudentsTableChange = (newPagination) => {
    fetchStudentsTable(newPagination.current, newPagination.pageSize);
  };
  const handleSwapsTableChange = (newPagination) => {
    fetchSwapsTable(newPagination.current, newPagination.pageSize);
  };
  const handleTransactionsTableChange = (newPagination) => {
    fetchTransactionsTable(newPagination.current, newPagination.pageSize);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // --- CHART COMPONENTS ---

  const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />;

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} 
            />
            <Tooltip 
              formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Bar dataKey="value" name="Revenue" fill="#1890ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const TransactionChart = ({ data }) => {
    if (!data || data.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />;

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip labelFormatter={(label) => `Date: ${label}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Transactions" 
              stroke="#722ed1" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const UserGrowthChart = ({ data }) => {
    if (!data || data.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />;

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#52c41a" 
              fillOpacity={1} 
              fill="url(#colorUser)" 
              name="New Users" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const PieChartComponent = ({ data }) => {
    if (!data || data.length === 0 || data.every(item => item.value === 0)) 
       return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Empty description="No Data" /></div>;

    return (
       <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </RePieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const pieData = swapSuccessData ? [
    { name: 'Approved', value: swapSuccessData.approvedSwaps, color: '#10B981' },
    { name: 'Rejected', value: swapSuccessData.rejectedSwaps, color: '#EF4444' },
    { name: 'Pending', value: swapSuccessData.pendingSwaps, color: '#F59E0B' }
  ] : [];

  const transactionsColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'User', dataIndex: 'userName', key: 'userName' },
    { title: 'Coin', dataIndex: 'coin', key: 'coin', render: (coin) => formatCurrency(coin) },
    // { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount) => formatCurrency(amount) },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => (
        <Tag color={type === 'IN' ? 'green' : 'red'}>
          {type === 'IN' ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {type}
        </Tag>
      )},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
        const colors = { COMPLETED: 'green', FAILED: 'red', PENDING: 'orange', CANCELLED: 'default' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }},
    { title: 'Source', dataIndex: 'source', key: 'source' }
  ];

  const tabItems = [
    { key: 'transactions', label: 'Transactions', children: <Table columns={transactionsColumns} dataSource={transactionsData} rowKey="id" pagination={transactionsPagination} onChange={handleTransactionsTableChange} loading={loading} /> }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header with Filters */}
      <div style={{ marginBottom: 24, background: '#fff', padding: 16, borderRadius: 8 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <h2 style={{ margin: 0 }}>Dashboard</h2>
          </Col>
          <Col>
            <Space wrap>
              <RangePicker onChange={handleDateRangeChange} />
              <Select
                placeholder="Select University"
                style={{ width: 200 }}
                value={filters.universityId}
                onChange={handleUniversityChange}
                allowClear
              >
                {filterOptions.universities.map(uni => (
                  <Option key={uni.id} value={uni.id}>{uni.name}</Option>
                ))}
              </Select>
              <Select
                placeholder="Select Campus"
                style={{ width: 200 }}
                value={filters.campusId}
                onChange={(value) => setFilters({ ...filters, campusId: value })}
                allowClear
                disabled={!filters.universityId}
              >
                {filterOptions.campuses
                  .filter(campus => !filters.universityId || campus.universityId === filters.universityId)
                  .map(campus => (
                    <Option key={campus.id} value={campus.id}>{campus.name}</Option>
                  ))}
              </Select>
              
              <Button icon={<ReloadOutlined />} onClick={fetchAllData}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {/* KPI Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Total Users" value={kpis?.totalUsers || 0} prefix={<UserOutlined />} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Revenue" value={kpis?.revenue || 0} prefix={<DollarOutlined />} formatter={(value) => formatCurrency(value)} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Active Students" value={kpis?.activeStudents || 0} prefix={<TeamOutlined />} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
        </Row>

        {/* Additional KPIs row */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
             <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Pending Actions" value={kpis?.pendingActions || 0} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Total Swaps" value={kpis?.totalSwaps || 0} prefix={<SwapOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Total Transactions" value={kpis?.totalTransactions || 0} prefix={<TransactionOutlined />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>

        {/* Charts Row 2 - Transaction Chart */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card 
          style={{ marginTop: 24 }} 
          title="Revenue Statistics"
          extra={
            <Select 
              defaultValue="DAY" 
              value={revenueGroupBy} 
              onChange={(value) => setRevenueGroupBy(value)} 
              style={{ width: 120 }}
            >
              <Option value="DAY">Day</Option>
              <Option value="MONTH">Month</Option>
              <Option value="YEAR">Year</Option>
            </Select>
          }
        >
           {/* Sử dụng lại Component RevenueChart đã có sẵn trong file */}
           <RevenueChart data={revenueData} />
        </Card>

        <Card title="Transaction Trend (Line Chart)">
              <TransactionChart data={transactionTrendData} />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Swap Success Rate" style={{ height: '100%' }}> {/* height 100% để card dài bằng bên trái nếu cần */}
              {/* Thay đổi layout bên trong: Xếp dọc (column) thay vì Row/Col ngang */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Phần biểu đồ tròn nằm trên */}
                <div style={{ width: '100%', height: 250 }}> {/* Giảm chiều cao chart một chút cho cân đối */}
                  <PieChartComponent data={pieData} />
                </div>

                {/* Phần số liệu nằm dưới */}
                <div style={{ width: '100%', marginTop: 24, padding: '0 16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Statistic 
                          title="Success Rate" 
                          value={swapSuccessData?.successRate || 0} 
                          precision={2} 
                          suffix="%" 
                          valueStyle={{ fontSize: 42, color: '#52c41a' }} 
                        />
                    </div>
                    
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Swaps:</span>
                            <strong>{swapSuccessData?.totalSwaps || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><span style={{color: '#10B981'}}>●</span> Approved:</span>
                            <strong>{swapSuccessData?.approvedSwaps || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><span style={{color: '#EF4444'}}>●</span> Rejected:</span>
                            <strong>{swapSuccessData?.rejectedSwaps || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><span style={{color: '#F59E0B'}}>●</span> Pending:</span>
                            <strong>{swapSuccessData?.pendingSwaps || 0}</strong>
                        </div>
                    </Space>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Data Tables */}
        <Card>
          <Tabs items={tabItems} />
        </Card>
      </Spin>
    </div>
  );
};

export default DashboardPage;