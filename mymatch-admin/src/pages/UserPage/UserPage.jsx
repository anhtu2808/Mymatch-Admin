import React, { useState } from 'react'
import './UserPage.css'
import { Tabs } from 'antd'
import { useInternalNotification } from 'antd/es/notification/useNotification';
import { useNavigate } from 'react-router-dom';
import LecturerPage from '../LecturerPage/LecturerPage';


export const UserPage = () => {
  const { TabPane } = Tabs;
  const [reloadFlag, setReloadFlag] = useState(0);
  const location = useInternalNotification();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'lecturer';
  const navigate = useNavigate();
  const setActiveTab = (key) => {
    navigate(`?tab=${key}`)
  }
  return (
    <div className="px-4">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Lecturer" key="lecturer">
          <LecturerPage />
        </TabPane>
      </Tabs>
    </div>
  )
}
