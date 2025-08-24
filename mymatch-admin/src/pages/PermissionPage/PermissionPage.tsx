import React, { useEffect, useState } from "react";
import {
  Table,
  Checkbox,
  Spin,
  message,
  Card,
  Button,
  Modal,
  Form,
  Input,
} from "antd";
import {
  getAllPermissionsAPI,
  getAllRolesAPI,
  updateRoleAPI,
  createPermissionAPI,
  deletePermissionAPI,
} from "../../api";
import { Role } from "../../types/role";
import { Permission } from "../../types/permission";

const PermissionPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPermModalVisible, setIsPermModalVisible] = useState(false);
  const [permForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAllRolesAPI.getAll(), getAllPermissionsAPI.getAll()])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.result);
        setPermissions(permsRes.result);
      })
      .catch((err) => {
        console.error(err);
        message.error("Không tải được dữ liệu vai trò/quyền");
      })
      .finally(() => setLoading(false));
  };

  const handleSaveRole = async (role: Role) => {
    try {
      const permissionIds = role.permissions.map((p) => p.id);
      await updateRoleAPI.update(role.id, {
        name: role.name,
        description: role.description,
        permissions: permissionIds,
      });
      message.success(`Đã lưu quyền cho role ${role.name}`);
    } catch (err) {
      console.error(err);
      message.error("Lưu quyền thất bại");
    }
  };

  const handleCreatePermission = async () => {
    try {
      const values = await permForm.validateFields();
      await createPermissionAPI.create({
        name: values.name,
        description: values.description,
      });
      message.success("Tạo quyền mới thành công");
      setIsPermModalVisible(false);
      permForm.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Tạo quyền thất bại");
    }
  };

  const handleDeletePermission = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa quyền này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deletePermissionAPI.delete(id);
          message.success("Xóa quyền thành công");
          fetchData();
        } catch (err) {
          console.error(err);
          message.error("Xóa quyền thất bại");
        }
      },
    });
  };

  if (loading)
    return <Spin style={{ display: "block", margin: "100px auto" }} />;

  // DataSource = Permissions (hàng)
  const dataSource = permissions.map((perm) => {
    const row: any = {
      key: perm.id,
      id: perm.id,
      name: perm.name,
      description: perm.description,
      action: (
        <Button
          danger
          type="link"
          onClick={() => handleDeletePermission(perm.id)}
        >
          Xóa
        </Button>
      ),
    };

    roles.forEach((role) => {
      const hasPermission = role.permissions.some((p) => p.id === perm.id);
      row[`role_${role.id}`] = (
        <Checkbox
          checked={hasPermission}
          onChange={(e) => {
            const checked = e.target.checked;
            setRoles((prev) =>
              prev.map((r) =>
                r.id === role.id
                  ? {
                      ...r,
                      permissions: checked
                        ? [...r.permissions, perm]
                        : r.permissions.filter((p) => p.id !== perm.id),
                    }
                  : r
              )
            );
          }}
        />
      );
    });

    return row;
  });

  // Columns = Permission info + dynamic Role columns
  const columns: any[] = [
    {
      title: "Quyền",
      dataIndex: "name",
      key: "name",
      width: 200,
      fixed: "left",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
    },
    ...roles.map((role) => ({
      title: (
        <div style={{ textAlign: "center" }}>
          <div>{role.name}</div>
          <Button
            type="link"
            size="small"
            onClick={() => handleSaveRole(role)}
          >
            Lưu
          </Button>
        </div>
      ),
      dataIndex: `role_${role.id}`,
      key: `role_${role.id}`,
      align: "center" as const,
    })),
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 100,
      fixed: "right",
    },
  ];

  return (
    <Card
      title="Ma trận Quyền - Vai trò"
      style={{ margin: 20 }}
      extra={
        <Button type="primary" onClick={() => setIsPermModalVisible(true)}>
          + Thêm Permission
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        scroll={{ x: true }}
      />

      {/* Modal thêm Permission */}
      <Modal
        title="Thêm Permission mới"
        open={isPermModalVisible}
        onOk={handleCreatePermission}
        onCancel={() => setIsPermModalVisible(false)}
      >
        <Form form={permForm} layout="vertical">
          <Form.Item
            label="Tên Permission"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên permission" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PermissionPage;
