import { BaseService } from "@/core/service/base.service";
import {
  DonHang,
  CreateDonHangDto,
  UpdateDonHangDto
} from "../types/don-hang.types";

export class DonHangService extends BaseService<
  DonHang,
  CreateDonHangDto,
  UpdateDonHangDto
> {
  protected resourcePath = "/don-hang";
}

export const donHangService = new DonHangService();
