import axios, { AxiosError } from 'axios';
import type { Video, PaginationResponse, ApiError, ClassesResponse, StudentsResponse } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const videoApi = {
  upload: (file: File, data: { title: string; description: string; className: string; studentName: string }, options?: { onUploadProgress?: (progressEvent: any) => void }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('class_name', data.className);
    formData.append('student_name', data.studentName);
    
    return api.post<{ video: Video }>('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: options?.onUploadProgress,
    });
  },

  list: (params?: { className?: string; studentName?: string; page?: number; limit?: number }) => {
    const queryParams: Record<string, string> = {};
    if (params?.className) queryParams.class_name = params.className;
    if (params?.studentName) queryParams.student_name = params.studentName;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    
    return api.get<PaginationResponse<Video>>('/videos', { params: queryParams });
  },

  get: (id: string) => api.get<{ video: Video }>(`/videos/${id}`),

  delete: (id: string) => api.delete(`/videos/${id}`),

  getClasses: () => api.get<ClassesResponse>('/classes'),

  getStudents: (className?: string) => api.get<StudentsResponse>('/students', { 
    params: className ? { class_name: className } : {} 
  }),
};

export function getVideoUrl(video: Video): string {
  return `${API_URL}${video.url}`;
}

export default api;