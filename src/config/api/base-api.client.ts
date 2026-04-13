import { request } from "@umijs/max";
import { env } from "../../../config/env";
import {
  LOCALSTORAGE_ACCESS_TOKEN_KEY,
  LOCALSTORAGE_USER,
} from "../constant/local-storage";

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

type AuthErrorHandler = () => void | Promise<void>;

interface ApiClientOptions {
  retryConfig?: Partial<RetryConfig>;
  onAuthError?: AuthErrorHandler;
  timeout?: number;
}

class ClientStorage {
  static getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  static setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}

const defaultRetryCondition = (error: any): boolean => {
  const status = error?.response?.status;
  return (
    !status ||
    status >= 500 ||
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  );
};

const getRetryDelay = (attempt: number, baseDelay: number): number => {
  return baseDelay * 2 ** attempt;
};

export class BaseApiClient {
  protected retryConfig: RetryConfig;
  private authErrorHandler?: AuthErrorHandler;

  constructor(options?: ApiClientOptions) {
    this.retryConfig = {
      retries: options?.retryConfig?.retries ?? 3,
      retryDelay: options?.retryConfig?.retryDelay ?? 1000,
      retryCondition:
        options?.retryConfig?.retryCondition ?? defaultRetryCondition,
    };
    this.authErrorHandler = options?.onAuthError;
  }

  protected getAuthToken(): string | null {
    return ClientStorage.getItem(LOCALSTORAGE_ACCESS_TOKEN_KEY);
  }

  protected setAuthToken(token: string | null): void {
    if (token) {
      ClientStorage.setItem(LOCALSTORAGE_ACCESS_TOKEN_KEY, token);
    } else {
      ClientStorage.removeItem(LOCALSTORAGE_ACCESS_TOKEN_KEY);
    }
  }

  protected clearAuth(): void {
    ClientStorage.removeItem(LOCALSTORAGE_ACCESS_TOKEN_KEY);
    ClientStorage.removeItem(LOCALSTORAGE_USER);
  }

  protected handleAuthError(): void {
    if (this.authErrorHandler) {
      this.authErrorHandler();
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        attempt < this.retryConfig.retries &&
        this.retryConfig.retryCondition!(error)
      ) {
        const delay = getRetryDelay(attempt, this.retryConfig.retryDelay);
        console.warn(
          `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${
            this.retryConfig.retries
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, attempt + 1);
      }
      throw error;
    }
  }

  protected async request<T>(config: any): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fullUrl = `${env.api.baseUrl}${config.url}`;

    return this.executeWithRetry(() =>
      request<T>(fullUrl, {
        ...config,
        headers: {
          ...headers,
          ...config.headers,
        },
      }).then((res) => res.data as T)
    );
  }

  protected async get<T>(url: string, config?: any): Promise<T> {
    return this.request<T>({ url, method: "GET", ...config });
  }

  protected async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: any
  ): Promise<T> {
    return this.request<T>({ url, method: "POST", data, ...config });
  }

  protected async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: any
  ): Promise<T> {
    return this.request<T>({ url, method: "PUT", data, ...config });
  }

  protected async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: any
  ): Promise<T> {
    return this.request<T>({ url, method: "PATCH", data, ...config });
  }

  protected async delete<T>(url: string, config?: any): Promise<T> {
    return this.request<T>({ url, method: "DELETE", ...config });
  }
}

export const createApiClient = (options?: ApiClientOptions): BaseApiClient => {
  return new BaseApiClient(options);
};
