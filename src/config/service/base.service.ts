import { BaseApiClient } from "../api/base-api.client";
import type {
  AffectedResponse,
  ApiResponse,
  BaseEntity,
  CountResponse,
  ExistsResponse,
  PageableResponse,
  QueryOptions,
} from "../types/base.types";

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

class QueryBuilder {
  constructor(private params = new URLSearchParams()) {}

  appendIfDefined(key: string, value: unknown): this {
    if (value !== undefined && value !== null) {
      const strVal =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      this.params.append(key, strVal);
    }
    return this;
  }

  toString(): string {
    return this.params.toString();
  }
}

export abstract class BaseService<
  TEntity extends BaseEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>
> extends BaseApiClient {
  protected abstract resourcePath: string;

  protected getResourceUrl(path?: string): string {
    return path ? `${this.resourcePath}/${path}` : this.resourcePath;
  }

  protected buildQueryParams(options?: QueryOptions): string {
    const builder = new QueryBuilder()
      .appendIfDefined("filter", options?.filter)
      .appendIfDefined("sort", options?.sort)
      .appendIfDefined("select", options?.select)
      .appendIfDefined("populate", options?.populate)
      .appendIfDefined("page", options?.page)
      .appendIfDefined("size", options?.size)
      .appendIfDefined("limit", options?.limit)
      .appendIfDefined("offset", options?.offset);
    const qs = builder.toString();
    return qs ? `?${qs}` : "";
  }

  protected handleError(error: unknown, operation: string): never {
    if (error instanceof ServiceError) throw error;
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    throw new ServiceError(
      err?.response?.data?.message || err?.message || `Failed to ${operation}`,
      `${operation.toUpperCase().replace(/\s+/g, "_")}_ERROR`,
      err?.response?.status
    );
  }

  async create(createDto: TCreateDto): Promise<ApiResponse<TEntity>> {
    return this.request<ApiResponse<TEntity>>({
      url: this.resourcePath,
      method: "POST",
      data: createDto,
    });
  }

  async getPage(
    options?: QueryOptions
  ): Promise<ApiResponse<PageableResponse<TEntity>>> {
    const qs = this.buildQueryParams(options);
    return this.get<ApiResponse<PageableResponse<TEntity>>>(
      `${this.getResourceUrl("page")}${qs}`
    );
  }

  async getMany(options?: QueryOptions): Promise<ApiResponse<TEntity[]>> {
    const qs = this.buildQueryParams(options);
    return this.get<ApiResponse<TEntity[]>>(
      `${this.getResourceUrl("all")}${qs}`
    );
  }

  async count(options?: QueryOptions): Promise<ApiResponse<number>> {
    const builder = new QueryBuilder().appendIfDefined(
      "filter",
      options?.filter
    );
    const qs = builder.toString();
    const url = qs
      ? `${this.getResourceUrl("count")}?${qs}`
      : this.getResourceUrl("count");
    const res = await this.get<ApiResponse<CountResponse>>(url);
    return { success: true, data: res.data.count };
  }

  async getOne(options?: QueryOptions): Promise<ApiResponse<TEntity>> {
    const builder = new QueryBuilder()
      .appendIfDefined("filter", options?.filter)
      .appendIfDefined("select", options?.select)
      .appendIfDefined("populate", options?.populate);
    const qs = builder.toString();
    const url = qs
      ? `${this.getResourceUrl("one")}?${qs}`
      : this.getResourceUrl("one");
    const res = await this.get<ApiResponse<TEntity>>(url);
    if (!res.data) throw new ServiceError("Entity not found", "NOT_FOUND", 404);
    return res;
  }

  async exists(options?: QueryOptions): Promise<ApiResponse<boolean>> {
    const builder = new QueryBuilder().appendIfDefined(
      "filter",
      options?.filter
    );
    const qs = builder.toString();
    const url = qs
      ? `${this.getResourceUrl("exists")}?${qs}`
      : this.getResourceUrl("exists");
    const res = await this.get<ApiResponse<ExistsResponse>>(url);
    return { success: true, data: res.data.exists };
  }

  async findById(id: number | string): Promise<ApiResponse<TEntity>> {
    if (!id) throw new ServiceError("ID is required", "VALIDATION_ERROR", 400);
    const res = await this.get<ApiResponse<TEntity>>(
      this.getResourceUrl(`id/${id}`)
    );
    if (!res.data)
      throw new ServiceError(
        `Entity with id ${id} not found`,
        "NOT_FOUND",
        404
      );
    return res;
  }

  async findByMa(ma: string): Promise<ApiResponse<TEntity>> {
    if (!ma) throw new ServiceError("Ma is required", "VALIDATION_ERROR", 400);
    const res = await this.get<ApiResponse<TEntity>>(
      this.getResourceUrl(`ma/${ma}`)
    );
    if (!res.data)
      throw new ServiceError(
        `Entity with ma ${ma} not found`,
        "NOT_FOUND",
        404
      );
    return res;
  }

  async update(
    id: number | string,
    updateDto: TUpdateDto
  ): Promise<ApiResponse<TEntity>> {
    if (!id) throw new ServiceError("ID is required", "VALIDATION_ERROR", 400);
    return this.request<ApiResponse<TEntity>>({
      url: this.getResourceUrl(String(id)),
      method: "PUT",
      data: updateDto,
    });
  }

  async updateMany(
    filter: Record<string, unknown>,
    data: Partial<TEntity>
  ): Promise<ApiResponse<AffectedResponse>> {
    if (!filter || Object.keys(filter).length === 0) {
      throw new ServiceError(
        "Filter is required for update many",
        "VALIDATION_ERROR",
        400
      );
    }
    return this.request<ApiResponse<AffectedResponse>>({
      url: this.getResourceUrl("update-many"),
      method: "PUT",
      data: { filter: JSON.stringify(filter), data },
    });
  }

  async remove(id: number | string): Promise<ApiResponse<AffectedResponse>> {
    if (!id) throw new ServiceError("ID is required", "VALIDATION_ERROR", 400);
    return this.request<ApiResponse<AffectedResponse>>({
      url: this.getResourceUrl(String(id)),
      method: "DELETE",
    });
  }

  async deleteMany(
    filter: Record<string, unknown>
  ): Promise<ApiResponse<AffectedResponse>> {
    if (!filter || Object.keys(filter).length === 0) {
      throw new ServiceError(
        "Filter is required for delete many",
        "VALIDATION_ERROR",
        400
      );
    }
    return this.request<ApiResponse<AffectedResponse>>({
      url: this.getResourceUrl("delete-many"),
      method: "DELETE",
      data: { filter: JSON.stringify(filter) },
    });
  }

  async softDelete(
    filter: Record<string, unknown>
  ): Promise<ApiResponse<AffectedResponse>> {
    if (!filter || Object.keys(filter).length === 0) {
      throw new ServiceError(
        "Filter is required for soft delete",
        "VALIDATION_ERROR",
        400
      );
    }
    return this.request<ApiResponse<AffectedResponse>>({
      url: this.getResourceUrl("soft-delete"),
      method: "POST",
      data: { filter: JSON.stringify(filter) },
    });
  }

  async restore(
    filter: Record<string, unknown>
  ): Promise<ApiResponse<AffectedResponse>> {
    if (!filter || Object.keys(filter).length === 0) {
      throw new ServiceError(
        "Filter is required for restore",
        "VALIDATION_ERROR",
        400
      );
    }
    return this.request<ApiResponse<AffectedResponse>>({
      url: this.getResourceUrl("restore"),
      method: "POST",
      data: { filter: JSON.stringify(filter) },
    });
  }

  async createMany(createDtos: TCreateDto[]): Promise<ApiResponse<TEntity[]>> {
    const BATCH_SIZE = 10;
    const results: TEntity[] = [];
    for (let i = 0; i < createDtos.length; i += BATCH_SIZE) {
      const batch = createDtos.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((dto) =>
          this.request<ApiResponse<TEntity>>({
            url: this.resourcePath,
            method: "POST",
            data: dto,
          })
        )
      );
      results.push(...batchResults.map((r) => r.data));
    }
    return { success: true, data: results };
  }

  async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return operation();
  }

  async getEnumStats<K extends keyof TEntity>(
    field: K,
    options?: QueryOptions
  ): Promise<{ field: K; stats: Record<string, number>; total: number }> {
    const res = await this.getMany({ ...options, select: [String(field)] });
    const stats: Record<string, number> = {};
    res.data.forEach((entity) => {
      const value = String(entity[field]);
      stats[value] = (stats[value] || 0) + 1;
    });
    return { field, stats, total: res.data.length };
  }
}
