import { useRequest } from "@umijs/max";
import { testService } from "../service/test.service";
import type { CreateTestDto, Test, UpdateTestDto } from "../types/test.types";

export const useGetTestPage = (options?: any, queryOptions?: any) => {
  return useRequest(() => testService.getPage(options), {
    ...queryOptions,
  });
};

export const useGetTestList = (options?: any, queryOptions?: any) => {
  return useRequest(() => testService.getMany(options), {
    ...queryOptions,
  });
};

export const useCountTest = (options?: any, queryOptions?: any) => {
  return useRequest(() => testService.count(options), {
    ...queryOptions,
  });
};

export const useGetTestOne = (options?: any, queryOptions?: any) => {
  return useRequest(() => testService.getOne(options), {
    ...queryOptions,
  });
};

export const useExistsTest = (options?: any, queryOptions?: any) => {
  return useRequest(() => testService.exists(options), {
    ...queryOptions,
  });
};

export const useGetTestById = (id: number | undefined, queryOptions?: any) => {
  return useRequest(() => testService.findById(id!), {
    ready: !!id,
    ...queryOptions,
  });
};

export const useGetTestByMa = (ma: string | undefined, queryOptions?: any) => {
  return useRequest(() => testService.findByMa(ma!), {
    ready: !!ma,
    ...queryOptions,
  });
};

export const useCreateTest = () => {
  return useRequest((data: CreateTestDto) => testService.create(data), {
    manual: true,
  });
};

export const useUpdateTest = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateTestDto }) =>
      testService.update(id, data),
    { manual: true }
  );
};

export const useUpdateManyTest = () => {
  return useRequest(
    ({
      filter,
      data,
    }: {
      filter: Record<string, unknown>;
      data: Partial<Test>;
    }) => testService.updateMany(filter, data),
    { manual: true }
  );
};

export const useDeleteTest = () => {
  return useRequest((id: number) => testService.remove(id), { manual: true });
};

export const useDeleteManyTest = () => {
  return useRequest(
    (filter: Record<string, unknown>) => testService.deleteMany(filter),
    { manual: true }
  );
};

export const useSoftDeleteTest = () => {
  return useRequest(
    (filter: Record<string, unknown>) => testService.softDelete(filter),
    { manual: true }
  );
};

export const useRestoreTest = () => {
  return useRequest(
    (filter: Record<string, unknown>) => testService.restore(filter),
    { manual: true }
  );
};
