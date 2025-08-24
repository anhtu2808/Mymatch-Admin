import { ApiResponse } from "../types/common";
import { Permission, PermissionCreateRequest, PermissionUpdateRequest } from "../types/permission";
import { Role, RoleCreateRequest, RoleUpdateRequest } from "../types/role";
import axiosClient from "./axiosClient";


// Role API
export const getAllRolesAPI = {
  getAll: (): Promise<ApiResponse<Role[]>> => {
    return axiosClient.get("/roles");
  },
};

export const updateRoleAPI = {
  update: (id: number, data: RoleUpdateRequest): Promise<ApiResponse<Role>> => {
    return axiosClient.put(`/roles/${id}`, data);
  },
};

export const createRoleAPI = {
  create: (data: RoleCreateRequest): Promise<ApiResponse<Role>> => {
    return axiosClient.post("/roles", data);
  },
};

// Permission API

export const getAllPermissionsAPI = {
  getAll: (): Promise<ApiResponse<Permission[]>> => {
    return axiosClient.get("/permissions");
  },
};

export const createPermissionAPI = {
  create: (data: PermissionCreateRequest): Promise<ApiResponse<Permission>> => {
    return axiosClient.post("/permissions", data);
  },
};

export const updatePermissionAPI = {
  update: (id: number, data: PermissionUpdateRequest): Promise<ApiResponse<Permission>> => {
    return axiosClient.put(`/permissions/${id}`, data);
  },
};

export const deletePermissionAPI = {
  delete: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/permissions/${id}`);
  },
};
