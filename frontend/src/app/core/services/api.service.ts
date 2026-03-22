import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import notify from 'devextreme/ui/notify';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({ baseURL: API_URL });

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function showToast(message: string, type: 'success' | 'warning' | 'error' | 'info') {
  notify({ message, width: 'auto', minWidth: 280 }, type, 3500);
}

function toastType(status: number): 'success' | 'warning' | 'error' {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warning';
  return 'success';
}

// Request interceptor — inject Bearer token
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — toasts + 401 redirect
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() ?? '';
    const envelope = response.data;
    if (MUTATION_METHODS.includes(method) && envelope?.message) {
      showToast(envelope.message as string, toastType(response.status));
    }
    return response;
  },
  (error) => {
    const status: number = error.response?.status ?? 0;
    const envelope = error.response?.data;
    const message: string =
      envelope?.message ??
      error.response?.data?.title ??
      error.message ??
      'Ha ocurrido un error inesperado.';

    if (status === 401) {
      authService.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else {
      showToast(message, toastType(status));
    }

    return Promise.reject(error);
  },
);

type ApiResponse<T> = { success: boolean; message: string; data: T; statusCode: number };

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  apiClient.get<ApiResponse<T>>(url, config).then((r) => r.data.data);

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.post<ApiResponse<T>>(url, data, config).then((r) => r.data.data);

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.put<ApiResponse<T>>(url, data, config).then((r) => r.data.data);

export const del = (url: string, config?: AxiosRequestConfig) =>
  apiClient.delete<ApiResponse<unknown>>(url, config).then((r) => r.data.data);

export default apiClient;
