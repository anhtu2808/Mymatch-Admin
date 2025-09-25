import api from "../utils/api"

// Role API
export const getAllRolesAPI = async () => {
  const response = await api.get('/roles')
  console.log(response)
  return response.data
}

export const createRoleAPI = async (role) => {
  const response = await api.post('/roles', role)
  return response.data
}

export const updateRoleAPI = async (role) => {
  const response = await api.put(`/roles/${role.id}`, role)
  return response.data
}

export const deleteRoleAPI = async (id) => {
  const response = await api.delete(`/roles/${id}`)
  return response.data
}


// Permission API
export const getAllPermissionsAPI = async () => {
  const response = await api.get('/permissions')
  return response.data
}

export const createPermissionAPI = async (permission) => {
  const response = await api.post('/permissions', permission)
  return response.data
}

export const updatePermissionAPI = async (permission) => {
  const response = await api.put(`/permissions/${permission.id}`, permission)
  return response.data
}

export const deletePermissionAPI = async (id) => {
  const response = await api.delete(`/permissions/${id}`)
  return response.data
}




// User API


// Material API


// Review API