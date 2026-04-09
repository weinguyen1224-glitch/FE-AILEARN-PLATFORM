import { useRequest } from "@umijs/max";
import { testService } from "../service/test.service";
import {
  Test,
  CreateTestDto,
  UpdateTestDto
} from "../types/test.types";

export const useGetTest = (options?: any) => {
  return useRequest(() => testService.getMany(options));
};

export const useGetOneTest = (options?: any) => {
  return useRequest(() => testService.getOne(options));
};

export const useCreateTest = () => {
  return useRequest(
    (data: CreateTestDto) => testService.create(data),
    { manual: true }
  );
};

export const useUpdateTest = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateTestDto }) =>
      testService.update(id, data),
    { manual: true }
  );
};

export const useRemoveTest = () => {
  return useRequest(
    (id: number) => testService.remove(id),
    { manual: true }
  );
};
