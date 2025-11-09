import React, { useMemo } from 'react'
import { Button, Menu } from 'antd'
import { PieChartOutlined, TeamOutlined, SettingOutlined, FileTextOutlined, AppstoreOutlined, BookOutlined, FileDoneOutlined, SwapOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../utils/api'


const SideBar = ({ onNavigate }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const items = useMemo(() => [
    { key: '/', icon: <PieChartOutlined />, label: 'Dashboard' },
    { key: '/swap-class', icon: <SwapOutlined />, label: 'Swap Class' },
    { key: '/match-member', icon: <UsergroupAddOutlined />, label: 'Match member' },
    { key: '/materials', icon: <AppstoreOutlined />, label: 'Materials' },
    { key: '/reviews', icon: <FileTextOutlined />, label: 'Reviews' },
    { key: '/review-criterias', icon: <FileDoneOutlined />, label: 'Review Criterias' },
    { key: '/users', icon: <TeamOutlined />, label: 'Users' },
    { key: '/courses', icon: <BookOutlined />, label: 'Courses' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ], [])

  const onClick = ({ key }) => {
    navigate(key)
    if (onNavigate) onNavigate(key)
  }

const handleLogout = async () => {
  const accessToken = localStorage.getItem('access_token');

  try {
    await api.post('/auth/logout', { token: accessToken }); 
  } catch (error) {
    console.error('Đăng xuất thất bại:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  }
};

  return (
    <>
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={onClick}
      style={{ background: '#fff' }}
    />
    
    <Button onClick={() => handleLogout()}>Logout</Button>
    </>
  )
}

export default SideBar