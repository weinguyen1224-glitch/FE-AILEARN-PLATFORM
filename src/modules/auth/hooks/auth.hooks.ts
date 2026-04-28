import { useRequest } from "@umijs/max";
import { authService } from "../service/auth.service";
import type {
  Auth,
  CreateAuthDto,
  UpdateAuthDto,
} from "../types/auth.types";

export const useGetAuthPage = (options?: any, queryOptions?: any) => {
  return useRequest(() => authService.getPage(options), { ...queryOptions });
};

export const useGetAuthList = (options?: any, queryOptions?: any) => {
  return useRequest(() => authService.getMany(options), { ...queryOptions });
};

export const useCountAuth = (options?: any, queryOptions?: any) => {
  return useRequest(() => authService.count(options), { ...queryOptions });
};

export const useGetAuthOne = (options?: any, queryOptions?: any) => {
  return useRequest(() => authService.getOne(options), { ...queryOptions });
};

export const useExistsAuth = (options?: any, queryOptions?: any) => {
  return useRequest(() => authService.exists(options), { ...queryOptions });
};

export const useGetAuthById = (id: number | undefined, queryOptions?: any) => {
  return useRequest(() => authService.findById(id!), { ready: !!id, ...queryOptions });
};

export const useGetAuthByMa = (ma: string | undefined, queryOptions?: any) => {
  return useRequest(() => authService.findByMa(ma!), { ready: !!ma, ...queryOptions });
};

export const useCreateAuth = () => {
  return useRequest((data: CreateAuthDto) => authService.create(data), { manual: true });
};

export const useUpdateAuth = () => {
  return useRequest(({ id, data }: { id: number; data: UpdateAuthDto }) => authService.update(id, data), { manual: true });
};

export const useUpdateManyAuth = () => {
  return useRequest(({ filter, data }: { filter: Record<string, unknown>; data: Partial<Auth> }) => authService.updateMany(filter, data), { manual: true });
};

export const useDeleteAuth = () => {
  return useRequest((id: number) => authService.remove(id), { manual: true });
};

export const useDeleteManyAuth = () => {
  return useRequest((filter: Record<string, unknown>) => authService.deleteMany(filter), { manual: true });
};

export const useSoftDeleteAuth = () => {
  return useRequest((filter: Record<string, unknown>) => authService.softDelete(filter), { manual: true });
};

export const useRestoreAuth = () => {
  return useRequest((filter: Record<string, unknown>) => authService.restore(filter), { manual: true });
};