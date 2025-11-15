import React, { useState } from 'react'
import './UserPage.css'
import { Tabs } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom';
import LecturerPage from '../LecturerPage/LecturerPage';
import StudentPage from '../StudentPage/StudentPage';


export const UserPage = () => {
  const { TabPane } = Tabs;
  const [reloadFlag, setReloadFlag] = useState(0);
  const location = useLocation();

  const activeTab = new URLSearchParams(location.search).get('tab') || 'lecturer';
  const navigate = useNavigate();
  const setActiveTab = (key) => {
    navigate(`?tab=${key}`)
  }
  return (
    <div className="px-4">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Lecturers" key="lecturer">
          <LecturerPage />
        </TabPane>
        <TabPane tab="Students" key="student">
          <StudentPage />
        </TabPane>
      </Tabs>
    </div>
  )
}