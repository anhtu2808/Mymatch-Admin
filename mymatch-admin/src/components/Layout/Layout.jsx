import React, { useState } from 'react'
import { Layout as AntLayout, Drawer, Button } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { MenuOutlined } from '@ant-design/icons'
import SideBar from '../Sidebar/SideBar'
import useIsMobile from '../../hooks/useIsMobile'
import logo from "../../assets/logo.gif"

const { Header, Sider, Content } = AntLayout

const Layout = ({ children, headerContent }) => {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleNavigate = () => {
    if (isMobile) setDrawerOpen(false)
  }

  const navigation = useNavigate()

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg" theme="light" style={{ background: '#fff' }}>
          <div />
            <div className="logoSection" onClick={() => navigation("/")}>
          <div className="logo-video-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}> 
            <img 
              src={logo} 
              alt="MyMatch Logo Animation" 
              style={{ height: "100px", width: "100px" }}
            />
          </div>
        </div>
          <SideBar onNavigate={handleNavigate} />
        </Sider>
      )}

      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile && (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          )}
          {headerContent}
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ padding: 24, minHeight: 'calc(100vh - 64px - 32px)', background: '#fff', borderRadius: 8 }}>
            {children ? children : <Outlet />}
          </div>
        </Content>
      </AntLayout>

      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0, background: '#fff' }}
          width={280}
        >
          <div style={{ height: 64 }} />
          <SideBar onNavigate={handleNavigate} />
        </Drawer>
      )}
    </AntLayout>
  )
}

export default Layout