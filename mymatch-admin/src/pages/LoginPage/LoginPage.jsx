import React, { useState } from "react";
import { Form, Input, Button, Card, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ROOT } from "../../utils/constant";
import backgroundImg from "../../assets/background1.png";

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const onFinish = async (values) => {
    try {
      const response = await axios.post(`${API_ROOT}/auth/login`, values)
      if (response.data.code === 200) {
        localStorage.setItem('access_token', response.data.result.token)
        navigate('/')
      }
    } catch (error) {
      message.error(error.response.data.message)
    }finally {
      setLoading(false)
    }
  };

  return (
    <div className="login-container" 
      style={{ 
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
      <Card className="login-card" title="Login">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
