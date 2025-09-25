import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Checkbox,
  Button,
  Form,
  message,
  Card,
  Input,
  Row,
  Col,
  Typography,
  Space,
  Popconfirm,
  Tooltip, // Import Tooltip
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"; // Import icons
import {
  getAllPermissionsAPI,
  getAllRolesAPI,
  createPermissionAPI,
  updatePermissionAPI,
  deletePermissionAPI,
  createRoleAPI,
  updateRoleAPI,
} from "../../apis";
import { Preloading } from "../../components/Preloading/Preloading";
import "./PermissionPage.css";

const { Title } = Typography;

const PermissionPage = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [editingPermission, setEditingPermission] = useState(null);
  const [permissionForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const editSectionRef = useRef(null);

  /** Fetch roles + permissions */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [permRes, roleRes] = await Promise.all([
        getAllPermissionsAPI(),
        getAllRolesAPI(),
      ]);

      const perms = Array.isArray(permRes) ? permRes : permRes.result || [];
      const rs = (Array.isArray(roleRes) ? roleRes : roleRes.result || []).map(
        (role) => ({
          ...role,
          permissionArr: role.permissions?.map((p) => p.id) || [],
        })
      );

      setPermissions(perms);
      setRoles(rs);
    } catch (err) {
      message.error(err?.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /** Toggle checkbox in matrix */
  const handleCheckboxChange = (roleId, permissionId, checked) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const updatedPermissions = checked
          ? [...(role.permissionArr || []), permissionId]
          : (role.permissionArr || []).filter((p) => p !== permissionId);
        return { ...role, permissionArr: updatedPermissions };
      })
    );
  };

  /** Save role's permissions updates */
  const handleSaveRolePermissions = async (role) => {
    try {
      await updateRoleAPI({
        ...role,
        permissions: role.permissionArr || [],
      });
      message.success(`Updated permissions for role ${role.name}`);
    } catch (err) {
      message.error("Failed to update role");
    }
  };
  
  /** Handle Start Editing a Permission */
  const handleStartEdit = (permission) => {
    setEditingPermission(permission);
    permissionForm.setFieldsValue(permission);
    editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  /** Handle Cancel Edit */
  const handleCancelEdit = () => {
    setEditingPermission(null);
    permissionForm.resetFields();
  };

  /** Handle Create or Update a Permission */
  const handleSavePermission = async (values) => {
    try {
      if (editingPermission) {
        await updatePermissionAPI({ ...editingPermission, ...values });
        message.success("Permission updated successfully");
      } else {
        await createPermissionAPI(values);
        message.success("New permission created successfully");
      }
      handleCancelEdit();
      fetchData();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to save permission");
    }
  };
  
  /** Handle Delete a Permission */
  const handleDeletePermission = async (permissionId) => {
    try {
        await deletePermissionAPI(permissionId);
        message.success("Permission deleted successfully");
        fetchData();
    } catch (err) {
        message.error(err?.response?.data?.message || "Failed to delete permission");
    }
  };


  /** Handle Add New Role */
  const handleAddRole = async (values) => {
    try {
      await createRoleAPI(values);
      message.success("New role created successfully");
      roleForm.resetFields();
      fetchData();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to create role");
    }
  };
  
  /** Action Column Definition */
  const actionColumn = {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    width: 120,
    align: 'center',
    render: (_, record) => (
      <Space size="middle">
        <Tooltip title="Update">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleStartEdit(record)} 
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Delete this permission"
            description="Are you sure you want to delete this permission?"
            onConfirm={() => handleDeletePermission(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  };

  /** Matrix columns */
  const matrixColumns = [
    {
      title: "Permission",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 250,
    },
    ...roles.map((role) => ({
      title: role.name,
      dataIndex: role.id,
      key: role.id,
      align: "center",
      render: (_, record) => {
        const checked = role.permissionArr?.includes(record.id);
        return (
          <Checkbox
            checked={checked}
            onChange={(e) =>
              handleCheckboxChange(role.id, record.id, e.target.checked)
            }
          />
        );
      },
    })),
    actionColumn, // Add action column at the end
  ];

  return (
    <div className="permission-page">
      <Preloading isLoading={loading} />

      {/* Section 1: Permission Matrix */}
      <Card bordered={false}>
        <Title level={3}>Permission Matrix</Title>
        <Table
          rowKey="id"
          columns={matrixColumns}
          dataSource={permissions}
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
        />
        <div className="save-buttons">
          {roles.map((role) => (
            <Button
              key={role.id}
              onClick={() => handleSaveRolePermissions(role)}
              style={{ marginRight: 8, marginTop: 16 }}
            >
              Save {role.name} Permissions
            </Button>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: "24px" }} >
        <Row gutter={24}>
          {/* Section 2: Add/Update Permission */}
          <Col xs={24} md={12} ref={editSectionRef}>
            <Card bordered={false}>
              <Title level={3}>
                {editingPermission ? "Update Permission" : "Create New Permission"}
              </Title>
              <Form
                form={permissionForm}
                layout="vertical"
                onFinish={handleSavePermission}
              >
                <Form.Item
                  name="name"
                  label="Permission Name"
                  rules={[
                    { required: true, message: "Please input permission name!" },
                  ]}
                >
                  <Input placeholder="e.g., student:update" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Please input description!" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="e.g., Allows to update student"
                  />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {editingPermission ? "Update Permission" : "Create Permission"}
                        </Button>
                        {editingPermission && (
                            <Button onClick={handleCancelEdit}>
                                Cancel
                            </Button>
                        )}
                    </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Section 3: Add New Role */}
          <Col xs={24} md={12}>
            <Card bordered={false}>
              <Title level={3}>Create New Role</Title>
              <Form form={roleForm} layout="vertical" onFinish={handleAddRole}>
                <Form.Item
                  name="name"
                  label="Role Name"
                  rules={[
                    { required: true, message: "Please input role name!" },
                  ]}
                >
                  <Input placeholder="e.g., EDITOR" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Please input description!" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="e.g., Can edit and manage posts"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Create Role
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PermissionPage;