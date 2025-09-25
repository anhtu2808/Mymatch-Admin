import React from 'react'
import { Tabs } from 'antd'
import PermissionPage from '../PermissionPage/PermissionPage'

const SettingPage = () => {
  const items = [
    {
      key: 'permissions',
      label: 'Permissions',
      children: <PermissionPage />,
    },
    // Add more tabs here as needed
  ]

  return (
    <div>
      <Tabs defaultActiveKey="permissions" items={items} />
    </div>
  )
}

export default SettingPage