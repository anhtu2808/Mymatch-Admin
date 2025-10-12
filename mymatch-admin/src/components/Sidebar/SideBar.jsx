import React, { useMemo } from 'react'
import { Menu } from 'antd'
import { PieChartOutlined, TeamOutlined, SettingOutlined, FileTextOutlined, AppstoreOutlined, BookOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'


const SideBar = ({ onNavigate }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const items = useMemo(() => [
    { key: '/', icon: <PieChartOutlined />, label: 'Dashboard' },
    { key: '/materials', icon: <AppstoreOutlined />, label: 'Materials' },
    { key: '/reviews', icon: <FileTextOutlined />, label: 'Reviews' },
    { key: '/users', icon: <TeamOutlined />, label: 'Users' },
    { key: '/courses', icon: <BookOutlined />, label: 'Courses' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ], [])

  const onClick = ({ key }) => {
    navigate(key)
    if (onNavigate) onNavigate(key)
  }

  return (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={onClick}
      style={{ background: '#fff' }}
    />
  )
}

export default SideBar