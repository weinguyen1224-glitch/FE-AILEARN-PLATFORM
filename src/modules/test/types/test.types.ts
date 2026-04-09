import { BaseEntity } from "@/core/types/base.types";

export interface Test extends BaseEntity {
}

export interface CreateTestDto
  extends Omit<Test, "id" | "createdAt" | "updatedAt" | "deletedAt"> {
}

export interface UpdateTestDto
  extends Partial<CreateTestDto> {
}
