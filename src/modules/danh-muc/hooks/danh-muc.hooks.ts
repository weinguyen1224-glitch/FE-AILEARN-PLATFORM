import { useRequest } from "@umijs/max";
import { danhMucService } from "../service/danh-muc.service";
import {
  DanhMuc,
  CreateDanhMucDto,
  UpdateDanhMucDto
} from "../types/danh-muc.types";

export const useGetDanhMuc = (options?: any) => {
  return useRequest(() => danhMucService.getMany(options));
};

export const useGetOneDanhMuc = (options?: any) => {
  return useRequest(() => danhMucService.getOne(options));
};

export const useCreateDanhMuc = () => {
  return useRequest(
    (data: CreateDanhMucDto) => danhMucService.create(data),
    { manual: true }
  );
};

export const useUpdateDanhMuc = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateDanhMucDto }) =>
      danhMucService.update(id, data),
    { manual: true }
  );
};

export const useRemoveDanhMuc = () => {
  return useRequest(
    (id: number) => danhMucService.remove(id),
    { manual: true }
  );
};
