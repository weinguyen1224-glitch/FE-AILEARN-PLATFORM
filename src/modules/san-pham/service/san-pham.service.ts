import { BaseService } from "@/core/service/base.service";
import {
  SanPham,
  CreateSanPhamDto,
  UpdateSanPhamDto
} from "../types/san-pham.types";

export class SanPhamService extends BaseService<
  SanPham,
  CreateSanPhamDto,
  UpdateSanPhamDto
> {
  protected resourcePath = "/san-pham";
}

export const sanPhamService = new SanPhamService();
