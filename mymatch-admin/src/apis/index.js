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

//Lecturer API
export const getLecturersAPI = async (params = {}) => {
  let url = `/lecturers?page=${params.page || 1}&size=${params.size || 10}&sortBy=${params.sortBy || 'id'}&sortOrder=${params.sortOrder || 'DESC'}`;
  
  if (params.name && params.name !== '') {
    url += `&name=${params.name}`;
  }
  
  if (params.code && params.code !== '') {
    url += `&code=${params.code}`;
  }
  
  if (params.campusId && params.campusId !== 0) {
    url += `&campusId=${params.campusId}`;
  }

  
  const response = await api.get(url);
  return response.data;
}

export const getLecturerDetailAPI = async (id) => {
  const response = await api.get(`/lecturers/${id}`);
  return response.data;
}
export const updateLecturerAPI = async (id, data) => {
  const response = await api.put(`/lecturers/${id}`, data);
  return response.data;
}

export const deleteLecturerAPI = async (id) => {
  const response = await api.delete(`/lecturers/${id}`);
  return response.data;
}


// Review API
export const getReviewsAPI = async (params = {}) => {
  let url = `/reviews?page=${params.page || 1}&size=${params.size || 10}&sortBy=${params.sortBy || 'id'}&sortOrder=${params.sortOrder || 'DESC'}`;
  
  if (params.lecturerId && params.lecturerId !== 0) {
    url += `&lecturerId=${params.lecturerId}`;
  }
  
  if (params.courseId && params.courseId !== 0) {
    url += `&courseId=${params.courseId}`;
  }
  
  if (params.studentId && params.studentId !== 0) {
    url += `&studentId=${params.studentId}`;
  }
  
  if (params.semesterId && params.semesterId !== 0) {
    url += `&semesterId=${params.semesterId}`;
  }
  
  if (params.isVerified !== undefined) {
    url += `&isVerified=${params.isVerified}`;
  }
  
  if (params.isAnonymous !== undefined) {
    url += `&isAnonymous=${params.isAnonymous}`;
  }
  
  const response = await api.get(url);
  return response.data;
}
export const getReviewDetailAPI = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
}
export const updateReviewAPI = async (id, data) => {
  const response = await api.put(`/reviews/${id}`, data);
  return response.data;
}
export const verifyReviewAPI = async (id) => {
  const data = {
    isVerified: true,
  }
  const response = await api.put(`/reviews/${id}`, data);
  return response.data;
}
export const unverifyReviewAPI = async (id) => {
  const data = {
    isVerified: false,
  }
  const response = await api.put(`/reviews/${id}`, data);
  return response.data;
}
export const deleteReviewAPI = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
}
