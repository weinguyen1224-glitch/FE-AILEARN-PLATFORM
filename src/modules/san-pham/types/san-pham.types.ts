import type { BaseEntity } from '@/core/types/base.types';
import type { DanhMuc } from '@/modules/danh-muc/types/danh-muc.types';

export interface SanPham extends BaseEntity {
  ma: string;
  stt: number;
  ten: string;
  gia: number;
  giaSale?: number;
  moTa?: string;
  urlAnhBia?: string;
  urlAnhs?: string[];
  thuongHieu?: string;
  startAge?: number;
  endAge?: number;
  maDanhMuc?: string;
  danhMuc?: DanhMuc;
  listLoaiBienThe?: any[];
  listChiTietSanPham?: any[];
  listSku?: any[];
}

export interface CreateSanPhamDto
  extends Omit<
    SanPham,
    | 'id'
    | 'ma'
    | 'stt'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'danhMuc'
    | 'listLoaiBienThe'
    | 'listChiTietSanPham'
    | 'listSku'
  > {}

export interface UpdateSanPhamDto extends Partial<CreateSanPhamDto> {}
