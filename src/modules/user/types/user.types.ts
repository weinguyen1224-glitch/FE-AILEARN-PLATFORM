import { BaseEntity } from "@/config/types/base.types";

export interface User extends BaseEntity {
  username?: string;
  password?: string;
  soDienThoai?: string;
  ngaySinh?: Date | string;
  avatarUrl?: string;
  diaChi?: string;
  email?: string;
  hoTen: string;
  vaiTro: "Quản trị viên" | "Nhân viên" | "Khách hàng";
  active?: boolean;
}

export interface CreateUserDto
  extends Omit<
    User,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"
  > {}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
