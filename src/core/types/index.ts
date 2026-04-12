export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageableResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

export interface AffectedResponse {
  affected: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface SelectOption {
  label: string;
  value: string | number;
}
