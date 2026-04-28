export type SortOrder = "ASC" | "DESC";

export interface QueryOperators<T> {
  $eq?: T;
  $ne?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $in?: T[];
  $nin?: T[];
  $like?: string;
  $regex?: string | RegExp;
  $isNull?: boolean;
  $isNotNull?: boolean;
}

export type FilterValue<T> = T | QueryOperators<T>;

export interface QueryParams<T> {
  filter?: Partial<Record<keyof T, FilterValue<T[keyof T]>>> &
    Record<string, unknown>;
  sort?: Partial<Record<keyof T, SortOrder>>;
  select?: readonly (keyof T | string)[];
  populate?: readonly string[];
  page?: number;
  size?: number;
}

export class QueryBuilder<T> {
  private filter: Record<string, unknown> = {};
  private sort: Partial<Record<keyof T, SortOrder>> = {};
  private _select: (keyof T)[] = [];
  private _populate: string[] = [];
  private _page?: number;
  private _size?: number;

  // Comparison operators
  eq<K extends keyof T>(field: K, value: T[K]): this {
    return this.set(field, { $eq: value });
  }

  ne<K extends keyof T>(field: K, value: T[K]): this {
    return this.set(field, { $ne: value });
  }

  gt<K extends keyof T>(field: K, value: T[K]): this {
    return this.set(field, { $gt: value });
  }

  gte<K extends keyof T>(field: K, value: T[K]): this {
    return this.set(field, { $gte: value });
  }

  lt<K extends keyof T>(field: K, value: T[K]): this {
    return this.set(field, { $lt: value });
  }

  lte<K extends keyof T>(field: K, value: T[K]): this {
    return this.set(field, { $lte: value });
  }

  // Array operators
  in<K extends keyof T>(field: K, values: T[K][]): this {
    return this.set(field, { $in: values });
  }

  nin<K extends keyof T>(field: K, values: T[K][]): this {
    return this.set(field, { $nin: values });
  }

  // String operators
  like<K extends keyof T>(field: K, pattern: string): this {
    return this.set(field, { $like: pattern });
  }

  regex<K extends keyof T>(field: K, pattern: string | RegExp): this {
    const regexStr = typeof pattern === "string" ? pattern : pattern.source;
    return this.set(field, { $regex: regexStr });
  }

  // Null operators
  isNull<K extends keyof T>(field: K): this {
    return this.set(field, { $isNull: true });
  }

  isNotNull<K extends keyof T>(field: K): this {
    return this.set(field, { $isNotNull: true });
  }

  // Complex conditions
  and(...builders: QueryBuilder<T>[]): this {
    const conditions = builders.map((b) => b.buildFilter());
    this.filter.$and = this.filter.$and
      ? [...(this.filter.$and as unknown[]), ...conditions]
      : conditions;
    return this;
  }

  or(...builders: QueryBuilder<T>[]): this {
    const conditions = builders.map((b) => b.buildFilter());
    this.filter.$or = this.filter.$or
      ? [...(this.filter.$or as unknown[]), ...conditions]
      : conditions;
    return this;
  }

  not(builder: QueryBuilder<T>): this {
    this.filter.$not = builder.buildFilter();
    return this;
  }

  // Nested fields
  nested<K extends keyof T>(field: K, builder: QueryBuilder<T[K]>): this {
    this.filter[field as string] = builder.buildFilter();
    return this;
  }

  // Sorting
  orderBy<K extends keyof T>(field: K, order: SortOrder = "ASC"): this {
    this.sort[field] = order;
    return this;
  }

  asc<K extends keyof T>(...fields: K[]): this {
    fields.forEach((f) => (this.sort[f] = "ASC"));
    return this;
  }

  desc<K extends keyof T>(...fields: K[]): this {
    fields.forEach((f) => (this.sort[f] = "DESC"));
    return this;
  }

  // Field selection
  select<K extends keyof T>(...fields: K[]): this {
    this._select = [...this._select, ...fields];
    return this;
  }

  /**
   * Populate relations with single path
   * @param path - Relation path to populate (will suggest keys of T)
   * @example qb<DonHang>().populate("listChiTietDonHang")
   */
  populate<K extends keyof T>(path: K): this;
  /**
   * Populate relations with multiple paths
   * @param paths - Relation paths to populate (will suggest keys of T)
   * @example qb<SanPham>().populate("listLoaiBienThe", "user")
   */
  populate<K extends keyof T>(...paths: K[]): this;
  /**
   * Populate relations with string paths (for nested paths)
   * @param paths - Relation paths to populate
   * @example qb<SanPham>().populate("listLoaiBienThe.listBienThe")
   */
  populate(...paths: string[]): this;
  populate(...paths: Array<keyof T | string>): this {
    this._populate = [...this._populate, ...paths.map(String)];
    return this;
  }

  // Pagination
  paginate(page: number, size: number): this {
    this._page = page;
    this._size = size;
    return this;
  }

  page(p: number): this {
    this._page = p;
    return this;
  }

  size(s: number): this {
    this._size = s;
    return this;
  }

  limit(n: number): this {
    this._size = n;
    return this;
  }

  offset(n: number): this {
    this._page = Math.floor(n / (this._size || 10)) + 1;
    return this;
  }

  // Raw & Utility
  raw(filter: Partial<Record<keyof T, FilterValue<T[keyof T]>>>): this {
    Object.assign(this.filter, filter);
    return this;
  }

  clear(): this {
    this.filter = {};
    this.sort = {};
    this._select = [];
    this._populate = [];
    this._page = undefined;
    this._size = undefined;
    return this;
  }

  clone(): QueryBuilder<T> {
    const cloned = new QueryBuilder<T>();
    cloned.filter = { ...this.filter };
    cloned.sort = { ...this.sort };
    cloned._select = [...this._select];
    cloned._populate = [...this._populate];
    cloned._page = this._page;
    cloned._size = this._size;
    return cloned;
  }

  // Build methods
  buildFilter(): Record<string, unknown> {
    return { ...this.filter };
  }

  buildSort(): string | undefined {
    return Object.keys(this.sort).length > 0
      ? JSON.stringify(this.sort)
      : undefined;
  }

  buildSelect(): string | undefined {
    return this._select.length > 0 ? JSON.stringify(this._select) : undefined;
  }

  buildPopulate(): readonly string[] | undefined {
    return this._populate.length > 0
      ? this._populate as readonly string[]
      : undefined;
  }

  buildQueryParams(): QueryParams<T> {
    return {
      filter: this.filter as Partial<Record<keyof T, FilterValue<T[keyof T]>>> &
        Record<string, unknown>,
      sort: this.sort,
      select: this._select as readonly string[],
      populate: this._populate as readonly string[],
      page: this._page,
      size: this._size,
    };
  }

  buildQueryString(): string {
    const params = new URLSearchParams();

    if (Object.keys(this.filter).length > 0) {
      params.append("filter", JSON.stringify(this.filter));
    }
    if (Object.keys(this.sort).length > 0) {
      params.append("sort", JSON.stringify(this.sort));
    }
    if (this._select.length > 0) {
      params.append("select", JSON.stringify(this._select));
    }
    if (this._populate.length > 0) {
      params.append("populate", JSON.stringify(this._populate));
    }
    if (this._page !== undefined) {
      params.append("page", String(this._page));
    }
    if (this._size !== undefined) {
      params.append("size", String(this._size));
    }

    return params.toString();
  }

  buildURL(baseURL: string): string {
    const queryString = this.buildQueryString();
    return queryString ? `${baseURL}?${queryString}` : baseURL;
  }

  /**
   * Build serialized query options for seo-side service layer
   * Returns filter/sort/populate as JSON strings (required by QueryOptions)
   * @example
   * const options = qb<SanPham>().eq("id", 1).populate("sku").buildSerializedQuery();
   * useGetOneSanPham(options);
   */
  buildSerializedQuery(): {
    filter?: string;
    sort?: string;
    select?: string;
    populate?: string;
    page?: number;
    size?: number;
  } {
    return {
      filter:
        Object.keys(this.filter).length > 0
          ? JSON.stringify(this.filter)
          : undefined,
      sort: this.buildSort(),
      select: this.buildSelect(),
      populate:
        this._populate.length > 0
          ? JSON.stringify(this._populate)
          : undefined,
      page: this._page,
      size: this._size,
    };
  }

  private set<K extends keyof T>(field: K, value: unknown): this {
    this.filter[field as string] = value;
    return this;
  }
}

// Helper function
export const qb = <T>() => new QueryBuilder<T>();
