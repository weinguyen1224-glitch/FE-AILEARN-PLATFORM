import { BaseEntity } from "@/config/types/base.types";

export interface Test extends BaseEntity {
  name: string;
  description?: string;
}

export interface CreateTestDto
  extends Omit<Test, "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"> {
}

export interface UpdateTestDto
  extends Partial<CreateTestDto> {
}
