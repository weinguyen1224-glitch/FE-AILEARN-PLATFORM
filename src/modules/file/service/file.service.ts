import { BaseService } from "@/config/service/base.service";
import {
  File,
  CreateFileDto,
  UpdateFileDto
} from "../types/file.types";

export class FileService extends BaseService<
  File,
  CreateFileDto,
  UpdateFileDto
> {
  protected resourcePath = "/file";
}

export const fileService = new FileService();