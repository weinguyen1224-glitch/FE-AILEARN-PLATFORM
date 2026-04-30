import { BaseEntity } from "@/config/types/base.types";
import { User } from "@/modules/user";

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  hoTen: string;
  soDienThoai: string;
  email?: string;
}

export interface AuthResponse {
  payload: Partial<User>;
  accessToken: string;
  accessExpireAt: string;
}

export interface Auth extends BaseEntity {
  username: string;
  hoTen: string;
  role: string;
  avatar?: string;
  soDienThoai?: string;
  email?: string;
}

export interface CreateAuthDto
  extends Omit<Auth, "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"> {}

export interface UpdateAuthDto extends Partial<CreateAuthDto> {}
