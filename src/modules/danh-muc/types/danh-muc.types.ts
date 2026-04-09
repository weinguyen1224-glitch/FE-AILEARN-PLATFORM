import type { BaseEntity } from '@/core/types/base.types';

export interface DanhMuc extends BaseEntity {
  ma: string;
  stt: number;
  ten: string;
  active: boolean;
  moTa?: string;
  maDanhMucCha?: string;
  danhMucCha?: DanhMuc;
  listDanhMucCon?: DanhMuc[];
}

export interface CreateDanhMucDto
  extends Omit<
    DanhMuc,
    | 'id'
    | 'ma'
    | 'stt'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'danhMucCha'
    | 'listDanhMucCon'
  > {}

export interface UpdateDanhMucDto extends Partial<CreateDanhMucDto> {}
