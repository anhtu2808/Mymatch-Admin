import axios from 'axios';
import { API_ROOT } from './constant';

const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};

    if (!response) {
      return Promise.reject({ message: 'Network error. Please check your connection.', error });
    }

    if (response.status === 401 && !config?._retry) {
      config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Missing refresh token');

        const refreshResponse = await axios.post(`${API_ROOT}/auth/refresh`, { refreshToken });
        const newAccessToken = refreshResponse?.data?.accessToken || refreshResponse?.accessToken;
        if (!newAccessToken) throw new Error('No access token from refresh');

        localStorage.setItem('access_token', newAccessToken);
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(config);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(response.data || response || error);
  }
);

export default api;
