import { useRequest } from "@umijs/max";
import { userService } from "../service/user.service";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
} from "../types/user.types";

export const useGetUserPage = (options?: any, queryOptions?: any) => {
  return useRequest(() => userService.getPage(options), {
    ...queryOptions,
  });
};

export const useGetUserList = (options?: any, queryOptions?: any) => {
  return useRequest(() => userService.getMany(options), {
    ...queryOptions,
  });
};

export const useCountUser = (options?: any, queryOptions?: any) => {
  return useRequest(() => userService.count(options), {
    ...queryOptions,
  });
};

export const useGetUserOne = (options?: any, queryOptions?: any) => {
  return useRequest(() => userService.getOne(options), {
    ...queryOptions,
  });
};

export const useExistsUser = (options?: any, queryOptions?: any) => {
  return useRequest(() => userService.exists(options), {
    ...queryOptions,
  });
};

export const useGetUserById = (id: number | undefined, queryOptions?: any) => {
  return useRequest(() => userService.findById(id!), {
    ready: !!id,
    ...queryOptions,
  });
};

export const useGetUserByMa = (ma: string | undefined, queryOptions?: any) => {
  return useRequest(() => userService.findByMa(ma!), {
    ready: !!ma,
    ...queryOptions,
  });
};

export const useCreateUser = () => {
  return useRequest(
    (data: CreateUserDto) => userService.create(data),
    { manual: true }
  );
};

export const useUpdateUser = () => {
  return useRequest(
    ({ id, data }: { id: number; data: UpdateUserDto }) =>
      userService.update(id, data),
    { manual: true }
  );
};

export const useUpdateManyUser = () => {
  return useRequest(
    ({
      filter,
      data,
    }: {
      filter: Record<string, unknown>;
      data: Partial<User>;
    }) => userService.updateMany(filter, data),
    { manual: true }
  );
};

export const useDeleteUser = () => {
  return useRequest((id: number) => userService.remove(id), { manual: true });
};

export const useDeleteManyUser = () => {
  return useRequest(
    (filter: Record<string, unknown>) => userService.deleteMany(filter),
    { manual: true }
  );
};

export const useSoftDeleteUser = () => {
  return useRequest(
    (filter: Record<string, unknown>) => userService.softDelete(filter),
    { manual: true }
  );
};

export const useRestoreUser = () => {
  return useRequest(
    (filter: Record<string, unknown>) => userService.restore(filter),
    { manual: true }
  );
};
