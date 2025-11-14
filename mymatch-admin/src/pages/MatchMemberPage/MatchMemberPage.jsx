import React from 'react'
import { Tabs } from 'antd'
import { TeamOutlined, UserOutlined } from '@ant-design/icons'
import Group from './Group'
import Member from './Member'

const { TabPane } = Tabs

function MatchMemberPage() {
  return (
    <div style={{ padding: '24px', background: '#fff' }}>
      <h2 style={{ marginBottom: '24px' }}>Match Member Management</h2>
        <Tabs
          defaultActiveKey="1"
          type="card"
          tabBarGutter={32}
          size="large"
        >
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Group Management
              </span>
            }
            key="1"
          >
            <Group />
          </TabPane>

          <TabPane
            tab={
              <span>
                <UserOutlined /> Member Management
              </span>
            }
            key="2"
          >
            <Member />
          </TabPane>
        </Tabs>
    </div>
  )
}

export default MatchMemberPage
