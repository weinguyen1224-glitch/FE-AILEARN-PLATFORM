import { BaseEntity } from "@/config/types/base.types";

export interface User extends BaseEntity {
  name: string;
  description?: string;
}

export interface CreateUserDto
  extends Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"> {
}

export interface UpdateUserDto
  extends Partial<CreateUserDto> {
}
