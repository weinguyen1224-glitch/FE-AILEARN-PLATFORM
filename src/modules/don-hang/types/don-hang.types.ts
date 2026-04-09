import type { BaseEntity } from '@/core/types/base.types';

export type TrangThaiDonHang =
  | 'DANG_XU_LY'
  | 'DANG_GIAO'
  | 'HOAN_THANH'
  | 'HUY';
export type TrangThaiThanhToan =
  | 'DANG_XU_LY'
  | 'CHUA_THANH_TOAN'
  | 'DA_THANH_TOAN';
export type HinhThucThanhToan = 'COD' | 'Banking';

export interface DonHang extends BaseEntity {
  ma: string;
  stt: number;
  maGioHang?: string;
  maUser?: string;
  tenNguoiNhan: string;
  diaChi: string;
  soDienThoai: string;
  tongTien: number;
  trangThai: TrangThaiDonHang;
  trangThaiThanhToan: TrangThaiThanhToan;
  hinhThucThanhToan: HinhThucThanhToan;
  listChiTietDonHang?: any[];
}

export interface CreateDonHangDto
  extends Omit<
    DonHang,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'listChiTietDonHang'
  > {}

export interface UpdateDonHangDto extends Partial<CreateDonHangDto> {}
