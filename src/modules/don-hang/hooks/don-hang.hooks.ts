import { useRequest } from "@umijs/max";
import { donHangService } from "../service/don-hang.service";
import {
  DonHang,
  CreateDonHangDto,
  UpdateDonHangDto
} from "../types/don-hang.types";

export const useGetDonHang = (options?: any) => {
  return useRequest(() => donHangService.getMany(options));
};

export const useGetOneDonHang = (options?: any) => {
  return useRequest(() => donHangService.getOne(options));
};

export const useCreateDonHang = () => {
  return useRequest(
    (data: CreateDonHangDto) => donHangService.create(data),
    { manual: true }
  );
};

export const useUpdateDonHang = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateDonHangDto }) =>
      donHangService.update(id, data),
    { manual: true }
  );
};

export const useRemoveDonHang = () => {
  return useRequest(
    (id: number) => donHangService.remove(id),
    { manual: true }
  );
};
