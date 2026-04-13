export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface PageableResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface AffectedResponse {
  affected: number;
}

export interface CountResponse {
  count: number;
}

export interface ExistsResponse {
  exists: boolean;
}

export interface QueryOptions {
  filter?: Record<string, any>;
  sort?: Record<string, "ASC" | "DESC">;
  select?: string[];
  populate?: string[];
  page?: number;
  size?: number;
  limit?: number;
  offset?: number;
}

export interface UpdateManyRequest<T> {
  filter: string;
  data: Partial<T>;
}

export interface DeleteManyRequest {
  filter: string;
}

export interface SoftDeleteRequest {
  filter: string;
}

export interface RestoreRequest {
  filter: string;
}
