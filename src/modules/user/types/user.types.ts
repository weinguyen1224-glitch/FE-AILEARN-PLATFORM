import { BaseEntity } from "@/config/types/base.types";
import { VaiTro } from "../common/constants";

export interface User extends BaseEntity {
  username?: string;
  password?: string;
  soDienThoai?: string;
  ngaySinh?: Date | string;
  avatarUrl?: string;
  diaChi?: string;
  email?: string;
  hoTen: string;
  vaiTro: VaiTro;
  active?: boolean;
}

export interface CreateUserDto
  extends Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"> {
}

export interface UpdateUserDto
  extends Partial<CreateUserDto> {
}