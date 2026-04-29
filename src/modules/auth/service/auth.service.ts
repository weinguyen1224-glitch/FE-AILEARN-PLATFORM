import { BaseApiClient } from "@/config/api/base-api.client";
import type { AuthResponse, LoginDto, RegisterDto } from "../types/auth.types";

export class AuthService extends BaseApiClient {
  protected resourcePath = "/auth";

  async login(data: LoginDto): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.resourcePath}/login`, data);
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    return this.post<AuthResponse>(`${this.resourcePath}/register`, data);
  }

  async logout(): Promise<void> {
    return this.post(`${this.resourcePath}/logout`);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.get<AuthResponse>(`${this.resourcePath}/refresh`, {
      refreshToken,
    });
  }
}

export const authService = new AuthService();
