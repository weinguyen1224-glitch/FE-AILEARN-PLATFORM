/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from "../api/base-api.client";
import type {
  AffectedResponse,
  BaseEntity,
  CountResponse,
  DeleteManyRequest,
  ExistsResponse,
  PageableResponse,
  QueryOptions,
  RestoreRequest,
  SoftDeleteRequest,
  UpdateManyRequest,
} from "../types/base.types";

export interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
}

class ConsoleLogger implements ILogger {
  private context = "BaseService";

  log(message: string, context?: string): void {
    console.log(`[${context || this.context}] ${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    console.error(`[${context || this.context}] ${message}`, trace || "");
  }

  warn(message: string, context?: string): void {
    console.warn(`[${context || this.context}] ${message}`);
  }

  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${context || this.context}] ${message}`);
    }
  }
}

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
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
  }

  appendIfDefined(key: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.params.append(key, String(value));
    }
    return this;
  }

  appendObject(
    key: string,
    value: Record<string, unknown> | undefined
  ): QueryBuilder {
    if (value && Object.keys(value).length > 0) {
      this.params.append(key, JSON.stringify(value));
    }
    return this;
  }

  toString(): string {
    return this.params.toString();
  }

  isEmpty(): boolean {
    return this.params.toString() === "";
  }
}

export abstract class BaseService<
  TEntity extends BaseEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>
> extends BaseApiClient {
  protected abstract resourcePath: string;
  protected readonly logger: ILogger;

  constructor(logger?: ILogger) {
    super();
    this.logger = logger || new ConsoleLogger();
  }

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

    const queryString = builder.toString();
    return queryString ? `?${queryString}` : "";
  }

  protected handleError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): never {
    if (error instanceof ServiceError) {
      throw error;
    }

    const err = error as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    const statusCode = err?.response?.status;
    const message =
      err?.response?.data?.message || err?.message || `Failed to ${operation}`;

    throw new ServiceError(
      message,
      `${operation.toUpperCase().replace(/\s+/g, "_")}_ERROR`,
      statusCode,
      context
    );
  }

  async create(createDto: TCreateDto): Promise<TEntity> {
    try {
      this.logger.debug(`Creating entity: ${JSON.stringify(createDto)}`);
      const result = await this.request<TEntity>({
        url: this.resourcePath,
        method: "POST",
        data: createDto,
      });
      this.logger.log(`Entity created with id: ${(result as any).id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create entity`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "create", { createDto });
    }
  }

  async getPage(options?: QueryOptions): Promise<PageableResponse<TEntity>> {
    try {
      this.logger.debug(
        `Getting page with options: ${JSON.stringify(options)}`
      );
      const queryString = this.buildQueryParams(options);
      const url = `${this.getResourceUrl("page")}${queryString}`;
      const result = await this.get<PageableResponse<TEntity>>(url);
      console.log("reusult", result);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get page`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "get page", { options });
    }
  }

  async getMany(options?: QueryOptions): Promise<TEntity[]> {
    try {
      this.logger.debug(
        `Getting many with options: ${JSON.stringify(options)}`
      );
      const queryString = this.buildQueryParams(options);
      const url = `${this.getResourceUrl("all")}${queryString}`;
      const result = await this.get<TEntity[]>(url);
      console.log(result);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get many`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "get many", { options });
    }
  }

  async count(options?: QueryOptions): Promise<number> {
    try {
      const builder = new QueryBuilder().appendIfDefined(
        "filter",
        options?.filter
      );

      const queryString = builder.toString();
      const url = queryString
        ? `${this.getResourceUrl("count")}?${queryString}`
        : this.getResourceUrl("count");

      const result = await this.get<CountResponse>(url);
      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to count`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "count", { options });
    }
  }

  async getOne(options?: QueryOptions): Promise<TEntity> {
    try {
      this.logger.debug(`Getting one with options: ${JSON.stringify(options)}`);
      const builder = new QueryBuilder()
        .appendIfDefined("filter", options?.filter)
        .appendIfDefined("select", options?.select)
        .appendIfDefined("populate", options?.populate);

      const queryString = builder.toString();
      const url = queryString
        ? `${this.getResourceUrl("one")}?${queryString}`
        : this.getResourceUrl("one");

      const result = await this.get<TEntity>(url);
      if (!result) {
        throw new ServiceError("Entity not found", "NOT_FOUND", undefined, {
          options,
        });
      }
      return result;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      this.logger.error(
        `Failed to get one`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "get one", { options });
    }
  }

  async exists(options?: QueryOptions): Promise<boolean> {
    try {
      const builder = new QueryBuilder().appendIfDefined(
        "filter",
        options?.filter
      );

      const queryString = builder.toString();
      const url = queryString
        ? `${this.getResourceUrl("exists")}?${queryString}`
        : this.getResourceUrl("exists");

      const result = await this.get<ExistsResponse>(url);
      return result.exists;
    } catch (error) {
      this.logger.error(
        `Failed to check existence`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "check exists", { options });
    }
  }

  async findById(id: number | string): Promise<TEntity> {
    try {
      if (!id) {
        throw new ServiceError("ID is required", "VALIDATION_ERROR", 400);
      }
      this.logger.debug(`Finding by id: ${id}`);
      const result = await this.get<TEntity>(this.getResourceUrl(`id/${id}`));
      if (!result) {
        throw new ServiceError(
          `Entity with id ${id} not found`,
          "NOT_FOUND",
          undefined,
          { id }
        );
      }
      return result;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      this.logger.error(
        `Failed to find by id: ${id}`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "find by id", { id });
    }
  }

  async findByMa(ma: string): Promise<TEntity> {
    try {
      if (!ma) {
        throw new ServiceError("Ma is required", "VALIDATION_ERROR", 400);
      }
      this.logger.debug(`Finding by ma: ${ma}`);
      const result = await this.get<TEntity>(this.getResourceUrl(`ma/${ma}`));
      if (!result) {
        throw new ServiceError(
          `Entity with ma ${ma} not found`,
          "NOT_FOUND",
          undefined,
          { ma }
        );
      }
      return result;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      this.logger.error(
        `Failed to find by ma: ${ma}`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "find by ma", { ma });
    }
  }

  async update(id: number | string, updateDto: TUpdateDto): Promise<TEntity> {
    try {
      if (!id) {
        throw new ServiceError("ID is required", "VALIDATION_ERROR", 400);
      }
      this.logger.debug(`Updating entity ${id}: ${JSON.stringify(updateDto)}`);

      await this.findById(id);

      const result = await this.request<TEntity>({
        url: this.getResourceUrl(String(id)),
        method: "PUT",
        data: updateDto,
      });
      this.logger.log(`Entity ${id} updated successfully`);
      return result;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      this.logger.error(
        `Failed to update entity ${id}`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "update", { id, updateDto });
    }
  }

  async updateMany(
    filter: Record<string, unknown>,
    data: Partial<TEntity>
  ): Promise<AffectedResponse> {
    try {
      if (!filter || Object.keys(filter).length === 0) {
        throw new ServiceError(
          "Filter is required for update many",
          "VALIDATION_ERROR",
          400
        );
      }
      this.logger.debug(`Updating many with filter: ${JSON.stringify(filter)}`);

      const reqData: UpdateManyRequest<TEntity> = {
        filter: JSON.stringify(filter),
        data,
      };
      const result = await this.request<AffectedResponse>({
        url: this.getResourceUrl("update-many"),
        method: "PUT",
        data: reqData,
      });
      this.logger.log(`Updated ${result.affected} entities`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update many`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "update many", { filter, data });
    }
  }

  async remove(id: number | string): Promise<AffectedResponse> {
    try {
      if (!id) {
        throw new ServiceError("ID is required", "VALIDATION_ERROR", 400);
      }
      this.logger.debug(`Removing entity ${id}`);

      await this.findById(id);

      const result = await this.request<AffectedResponse>({
        url: this.getResourceUrl(String(id)),
        method: "DELETE",
      });
      this.logger.log(`Entity ${id} removed successfully`);
      return result;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      this.logger.error(
        `Failed to remove entity ${id}`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "remove", { id });
    }
  }

  async deleteMany(filter: Record<string, unknown>): Promise<AffectedResponse> {
    try {
      if (!filter || Object.keys(filter).length === 0) {
        throw new ServiceError(
          "Filter is required for delete many",
          "VALIDATION_ERROR",
          400
        );
      }
      this.logger.debug(`Deleting many with filter: ${JSON.stringify(filter)}`);

      const reqData: DeleteManyRequest = {
        filter: JSON.stringify(filter),
      };
      const result = await this.request<AffectedResponse>({
        url: this.getResourceUrl("delete-many"),
        method: "DELETE",
        data: reqData,
      });
      this.logger.log(`Deleted ${result.affected} entities`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete many`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "delete many", { filter });
    }
  }

  async softDelete(filter: Record<string, unknown>): Promise<AffectedResponse> {
    try {
      if (!filter || Object.keys(filter).length === 0) {
        throw new ServiceError(
          "Filter is required for soft delete",
          "VALIDATION_ERROR",
          400
        );
      }
      this.logger.debug(`Soft deleting with filter: ${JSON.stringify(filter)}`);

      const reqData: SoftDeleteRequest = {
        filter: JSON.stringify(filter),
      };
      const result = await this.request<AffectedResponse>({
        url: this.getResourceUrl("soft-delete"),
        method: "POST",
        data: reqData,
      });
      this.logger.log(`Soft deleted ${result.affected} entities`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to soft delete`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "soft delete", { filter });
    }
  }

  async restore(filter: Record<string, unknown>): Promise<AffectedResponse> {
    try {
      if (!filter || Object.keys(filter).length === 0) {
        throw new ServiceError(
          "Filter is required for restore",
          "VALIDATION_ERROR",
          400
        );
      }
      this.logger.debug(`Restoring with filter: ${JSON.stringify(filter)}`);

      const reqData: RestoreRequest = {
        filter: JSON.stringify(filter),
      };
      const result = await this.request<AffectedResponse>({
        url: this.getResourceUrl("restore"),
        method: "POST",
        data: reqData,
      });
      this.logger.log(`Restored ${result.affected} entities`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to restore`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "restore", { filter });
    }
  }

  async createMany(createDtos: TCreateDto[]): Promise<TEntity[]> {
    try {
      this.logger.debug(`Creating ${createDtos.length} entities`);
      const results: TEntity[] = [];

      const BATCH_SIZE = 10;
      for (let i = 0; i < createDtos.length; i += BATCH_SIZE) {
        const batch = createDtos.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map((dto) =>
          this.request<TEntity>({
            url: this.resourcePath,
            method: "POST",
            data: dto,
          })
        );
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        this.logger.debug(`Created batch ${Math.floor(i / BATCH_SIZE) + 1}`);
      }

      this.logger.log(`Created ${results.length} entities successfully`);
      return results;
    } catch (error) {
      this.logger.error(
        `Failed to create many entities`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "create many", { count: createDtos.length });
    }
  }

  async withTransaction<T>(
    operation: () => Promise<T>,
    transactionId?: string
  ): Promise<T> {
    const txId = transactionId || `tx-${Date.now()}`;
    this.logger.debug(`Starting transaction: ${txId}`);

    try {
      const result = await operation();
      this.logger.log(`Transaction completed: ${txId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Transaction failed: ${txId}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  async getEnumStats<K extends keyof TEntity>(
    field: K,
    options?: QueryOptions
  ): Promise<{ field: K; stats: Record<string, number>; total: number }> {
    try {
      this.logger.debug(`Getting enum stats for field: ${String(field)}`);

      const entities = await this.getMany({
        ...options,
        select: [String(field)],
      });

      const stats: Record<string, number> = {};
      entities.forEach((entity) => {
        const value = String(entity[field]);
        stats[value] = (stats[value] || 0) + 1;
      });

      const total = entities.length;

      this.logger.debug(`Enum stats calculated: ${JSON.stringify(stats)}`);
      return { field, stats, total };
    } catch (error) {
      this.logger.error(
        `Failed to get enum stats`,
        error instanceof Error ? error.stack : undefined
      );
      this.handleError(error, "get enum stats", { field, options });
    }
  }
}
