import { BaseEntity } from "@/config/types/base.types";
import { Type } from "../common/constants";

export interface File extends BaseEntity {
  path?: string;
  url?: string;
  type?: Type;
  extension?: string;
  uploadedBy?: string;
  module?: string;
  metadata?: Record<string, any>;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface CreateFileDto
  extends Omit<
    File,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"
  > {}

export interface UpdateFileDto extends Partial<CreateFileDto> {}
