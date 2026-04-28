import { BaseEntity } from "@/config/types/base.types";

export interface Auth extends BaseEntity {}

export interface CreateAuthDto
  extends Omit<
    Auth,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"
  > {}

export interface UpdateAuthDto extends Partial<CreateAuthDto> {}
