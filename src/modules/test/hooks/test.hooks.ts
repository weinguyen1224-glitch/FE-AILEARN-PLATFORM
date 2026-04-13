import { useRequest } from "@umijs/max";
import { testService } from "../service/test.service";
import { CreateTestDto, Test, UpdateTestDto } from "../types/test.types";

export const useGetTestPage = (options?: any) => {
  return useRequest(() => testService.getPage(options));
};

export const useGetTestList = (options?: any) => {
  return useRequest(() => testService.getMany(options));
};

export const useCountTest = (options?: any) => {
  return useRequest(() => testService.count(options));
};

export const useGetTestOne = (options?: any) => {
  return useRequest(() => testService.getOne(options));
};

export const useExistsTest = (options?: any) => {
  return useRequest(() => testService.exists(options));
};

export const useGetTestById = (id: number | undefined) => {
  return useRequest(() => testService.findById(id!), { ready: !!id });
};

export const useGetTestByMa = (ma: string | undefined) => {
  return useRequest(() => testService.findByMa(ma!), { ready: !!ma });
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
