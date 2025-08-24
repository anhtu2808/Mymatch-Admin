import { Permission } from "./permission";

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissions: number[];
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissions?: number[];
}
