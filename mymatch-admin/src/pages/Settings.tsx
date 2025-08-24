import React from 'react';
import { Form, Input, Switch, Button, Card, Row, Col, Divider, Select, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Settings saved:', values);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          siteName: 'MyMatch Admin',
          siteDescription: 'Gaming platform administration',
          maintenanceMode: false,
          emailNotifications: true,
          maxTeamSize: 6,
          allowTeamCreation: true,
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="General Settings" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Site Name"
                name="siteName"
                rules={[{ required: true, message: 'Please enter site name!' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                label="Site Description"
                name="siteDescription"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              
              <Form.Item
                label="Maintenance Mode"
                name="maintenanceMode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
            
            <Card title="Team Settings">
              <Form.Item
                label="Maximum Team Size"
                name="maxTeamSize"
                rules={[{ required: true, message: 'Please select max team size!' }]}
              >
                <Select>
                  <Option value={4}>4 Players</Option>
                  <Option value={5}>5 Players</Option>
                  <Option value={6}>6 Players</Option>
                  <Option value={8}>8 Players</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Allow Team Creation"
                name="allowTeamCreation"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="Notification Settings" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Email Notifications"
                name="emailNotifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                label="Match Results Notifications"
                name="matchNotifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                label="Team Invitation Notifications"
                name="invitationNotifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
            
            <Card title="Security Settings">
              <Form.Item
                label="Two-Factor Authentication"
                name="twoFactorAuth"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                rules={[{ required: true, message: 'Please enter session timeout!' }]}
              >
                <Input type="number" min={5} max={1440} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              size="large"
            >
              Save Settings
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => form.resetFields()}
            >
              Reset to Default
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default Settings;
