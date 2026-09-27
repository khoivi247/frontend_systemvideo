export interface Video {
  id: string;
  title: string;
  description?: string;
  filename: string;
  className: string;
  studentName: string;
  fileSize: number;
  createdAt: string;
  url: string;
}

export interface Compilation {
  id: string;
  name: string;
  token: string;
  videoIds: string[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  viewCount: number;
  shareUrl: string;
  videoCount: number;
  videos?: Video[];
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ClassesResponse {
  classes: string[];
}

export interface StudentsResponse {
  students: string[];
}
