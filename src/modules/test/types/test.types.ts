import { BaseEntity } from "@/config/types/base.types";

export interface Test extends BaseEntity {
  ma: string;
  stt: number;
}

export interface CreateTestDto
  extends Omit<
    Test,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"
  > {
  ma?: string;
}

export interface UpdateTestDto extends Partial<CreateTestDto> {}
