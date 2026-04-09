import { useRequest } from "@umijs/max";
import { sanPhamService } from "../service/san-pham.service";
import {
  SanPham,
  CreateSanPhamDto,
  UpdateSanPhamDto
} from "../types/san-pham.types";

export const useGetSanPham = (options?: any) => {
  return useRequest(() => sanPhamService.getMany(options));
};

export const useGetOneSanPham = (options?: any) => {
  return useRequest(() => sanPhamService.getOne(options));
};

export const useCreateSanPham = () => {
  return useRequest(
    (data: CreateSanPhamDto) => sanPhamService.create(data),
    { manual: true }
  );
};

export const useUpdateSanPham = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateSanPhamDto }) =>
      sanPhamService.update(id, data),
    { manual: true }
  );
};

export const useRemoveSanPham = () => {
  return useRequest(
    (id: number) => sanPhamService.remove(id),
    { manual: true }
  );
};
