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

export const createLecturerAPI = async (data) => {
  const response = await api.post('/lecturers', data);
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


// Course API
export const getCoursesAPI = async (params = {}) => {
  let url = `/courses?page=${params.page || 1}&size=${params.size || 10}&sortBy=${params.sortBy || 'code'}&sortOrder=${params.sortOrder || 'ASC'}`;

  if (params.code && params.code !== '') {
    url += `&code=${params.code}`;
  }

  if (params.name && params.name !== '') {
    url += `&name=${params.name}`;
  }
  if (params.universityId && params.universityId !== 0) {
    url += `&universityId=${params.universityId}`;
  }

  const response = await api.get(url);
  return response.data;
}

export const getCourseDetailAPI = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
}

export const createCourseAPI = async (course) => {
  const response = await api.post('/courses', course);
  return response.data;
}

export const updateCourseAPI = async (id, data) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
}

export const deleteCourseAPI = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
}


// University API
export const getAllUniversitiesAPI = async (params = {}) => {
  let url = `/universities?page=${params.page || 1}&size=${params.size || 10}&sort=${params.sort || 'id'}`;
  if (params.name && params.name !== '') {
    url += `&name=${params.name}`;
  }

  const response = await api.get(url);
  return response.data;
}

export const getUniversityByIdAPI = async (id) => {
  const response = await api.get(`/universities/${id}`);
  return response.data;
}

export const createUniversityAPI = async (data) => {
  const response = await api.post('/universities', data);
  return response.data;
}

export const updateUniversityAPI = async (id, data) => {
  const response = await api.put(`/universities/${id}`, data);
  return response.data;
}

export const deleteUniversityAPI = async (id) => {
  const response = await api.delete(`/universities/${id}`);
  return response.data;
}

// Review Criteria API
export const getReviewCriteriaAPI = async (params = {}) => {
  let url = `/review-criteria?page=${params.page || 1}&size=${params.size || 10}&sortBy=${params.sortBy || 'id'}&sortOrder=${params.sortOrder || 'DESC'}`;

  if (params.name && params.name !== '') {
    url += `&name=${params.name}`;
  }

  if (params.type && params.type !== '') {
    url += `&type=${params.type}`;
  }

  const response = await api.get(url);
  return response.data;
}

export const getReviewCriteriaDetailAPI = async (id) => {
  const response = await api.get(`/review-criteria/${id}`);
  return response.data;
}

export const createReviewCriteriaAPI = async (data) => {
  const response = await api.post('/review-criteria', data);
  return response.data;
}

export const updateReviewCriteriaAPI = async (id, data) => {
  const response = await api.put(`/review-criteria/${id}`, data);
  return response.data;
}

export const deleteReviewCriteriaAPI = async (id) => {
  const response = await api.delete(`/review-criteria/${id}`);
  return response.data;
}

// Material API
export const getMaterialsAPI = async (params = {}) => {
  let url = `/materials?page=${params.page || 1}&size=${params.size || 10}&sortBy=${params.sortBy || 'id'}&sortOrder=${params.sortOrder || 'DESC'}`;

  if (params.name && params.name !== '') {
    url += `&name=${params.name}`;
  }
  if (params.description && params.description !== '') {
    url += `&description=${params.description}`;
  }
  if (params.lecturerId && params.lecturerId !== 0) {
    url += `&lecturerId=${params.lecturerId}`;
  }
  if (params.ownerId && params.ownerId !== 0) {
    url += `&ownerId=${params.ownerId}`;
  }
  if (params.courseId && params.courseId !== 0) {
    url += `&courseId=${params.courseId}`;
  }
  if (params.isPurchased !== undefined && params.isPurchased !== null) {
    url += `&isPurchased=${params.isPurchased}`;
  }

  const response = await api.get(url);
  return response.data;
}

export const getMaterialDetailAPI = async (id) => {
  const response = await api.get(`/materials/${id}`);
  return response.data;
}

export const deleteMaterialAPI = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
}

export const downloadMaterialAPI = async (id) => {
  const response = await api.get(`/materials/${id}/download`, {
    responseType: 'blob',
  });
  return response;
}


// Campus API
export const getCampusesAPI = async (params = {}) => {
  let url = `/campuses?page=${params.page || 1}&size=${params.size || 10}&sort=${params.sort || 'id'}`;

  if (params.name && params.name !== '') {
    url += `&name=${params.name}`;
  }

  if (params.address && params.address !== '') {
    url += `&address=${params.address}`;
  }

  const response = await api.get(url);
  return response.data;
}

export const getCampusDetailAPI = async (id) => {
  const response = await api.get(`/campuses/${id}`);
  return response.data;
}

export const createCampusAPI = async (data) => {
  const response = await api.post('/campuses', data);
  return response.data;
}

export const updateCampusAPI = async (id, data) => {
  const response = await api.put(`/campuses/${id}`, data);
  return response.data;
}

export const deleteCampusAPI = async (id) => {
  const response = await api.delete(`/campuses/${id}`);
  return response.data;
}