import { useRequest } from "@umijs/max";
import { fileService } from "../service/file.service";
import type { CreateFileDto, File, UpdateFileDto } from "../types/file.types";

export const useGetFilePage = (options?: any, queryOptions?: any) => {
  return useRequest(() => fileService.getPage(options), { ...queryOptions });
};

export const useGetFileList = (options?: any, queryOptions?: any) => {
  return useRequest(() => fileService.getMany(options), { ...queryOptions });
};

export const useCountFile = (options?: any, queryOptions?: any) => {
  return useRequest(() => fileService.count(options), { ...queryOptions });
};

export const useGetFileOne = (options?: any, queryOptions?: any) => {
  return useRequest(() => fileService.getOne(options), { ...queryOptions });
};

export const useExistsFile = (options?: any, queryOptions?: any) => {
  return useRequest(() => fileService.exists(options), { ...queryOptions });
};

export const useGetFileById = (id: number | undefined, queryOptions?: any) => {
  return useRequest(() => fileService.findById(id!), {
    ready: !!id,
    ...queryOptions,
  });
};

export const useGetFileByMa = (ma: string | undefined, queryOptions?: any) => {
  return useRequest(() => fileService.findByMa(ma!), {
    ready: !!ma,
    ...queryOptions,
  });
};

export const useCreateFile = () => {
  return useRequest((data: CreateFileDto) => fileService.create(data), {
    manual: true,
  });
};

export const useUpdateFile = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateFileDto }) =>
      fileService.update(id, data),
    { manual: true }
  );
};

export const useUpdateManyFile = () => {
  return useRequest(
    ({
      filter,
      data,
    }: {
      filter: Record<string, unknown>;
      data: Partial<File>;
    }) => fileService.updateMany(filter, data),
    { manual: true }
  );
};

export const useDeleteFile = () => {
  return useRequest((id: number) => fileService.remove(id), { manual: true });
};

export const useDeleteManyFile = () => {
  return useRequest(
    (filter: Record<string, unknown>) => fileService.deleteMany(filter),
    { manual: true }
  );
};

export const useSoftDeleteFile = () => {
  return useRequest(
    (filter: Record<string, unknown>) => fileService.softDelete(filter),
    { manual: true }
  );
};

export const useRestoreFile = () => {
  return useRequest(
    (filter: Record<string, unknown>) => fileService.restore(filter),
    { manual: true }
  );
};
