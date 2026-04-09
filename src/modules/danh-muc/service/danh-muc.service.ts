import { BaseService } from "@/core/service/base.service";
import {
  DanhMuc,
  CreateDanhMucDto,
  UpdateDanhMucDto
} from "../types/danh-muc.types";

export class DanhMucService extends BaseService<
  DanhMuc,
  CreateDanhMucDto,
  UpdateDanhMucDto
> {
  protected resourcePath = "/danh-muc";
}

export const danhMucService = new DanhMucService();
