export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface PermissionCreateRequest {
  name: string;
  description: string;
}

export interface PermissionUpdateRequest {
  name?: string;
  description?: string;
}
