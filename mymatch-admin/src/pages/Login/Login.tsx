import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_ROOT}/auth/login`,
        values,
        { headers: { "Content-Type": "application/json" } }
      );

      // Lưu token
      localStorage.setItem("accessToken", res.data.result.token);
      localStorage.setItem("refreshToken", res.data.result.token);

      message.success("Login thành công!");
      navigate("/dashboard"); // Điều hướng sang Dashboard
    } catch (error: any) {
      console.error(error);
      message.error("Sai username hoặc password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Login" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
