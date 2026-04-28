import { useRequest } from "@umijs/max";
import type { BaseService } from "../service/base.service";
import type {
  BaseEntity,
  BaseMutationOptions,
  QueryOptions,
} from "../types/base.types";

export function createBaseHooks<
  TEntity extends BaseEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>
>(queryKey: string, service: BaseService<TEntity, TCreateDto, TUpdateDto>) {
  const useGetPage = (
    options?: QueryOptions,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.getPage(options), queryOptions);
  };

  const useGetMany = (
    options?: QueryOptions,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.getMany(options), queryOptions);
  };

  const useCount = (
    options?: QueryOptions,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.count(options), queryOptions);
  };

  const useGetOne = (
    options?: QueryOptions,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.getOne(options), queryOptions);
  };

  const useExists = (
    options?: QueryOptions,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.exists(options), queryOptions);
  };

  const useFindById = (
    id: number | undefined,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.findById(id!), {
      ready: !!id,
      ...queryOptions,
    });
  };

  const useFindByMa = (
    ma: string | undefined,
    queryOptions?: Record<string, unknown>
  ) => {
    return useRequest(() => service.findByMa(ma!), {
      ready: !!ma,
      ...queryOptions,
    });
  };

  const useCreate = (options?: BaseMutationOptions) => {
    return useRequest(
      (data: TCreateDto) => service.create(data).then((res) => res.data),
      {
        manual: true,
      }
    );
  };

  const useUpdate = (options?: BaseMutationOptions) => {
    return useRequest(
      ({ id, data }: { id: number; data: TUpdateDto }) =>
        service.update(id, data).then((res) => res.data),
      {
        manual: true,
      }
    );
  };

  const useUpdateMany = () => {
    return useRequest(
      ({
        filter,
        data,
      }: {
        filter: Record<string, unknown>;
        data: Partial<TEntity>;
      }) => service.updateMany(filter, data).then((res) => res.data),
      { manual: true }
    );
  };

  const useRemove = () => {
    return useRequest(
      (id: number) => service.remove(id).then((res) => res.data),
      { manual: true }
    );
  };

  const useRemoveMany = () => {
    return useRequest(
      async (ids: number[]) => {
        const results = await Promise.all(ids.map((id) => service.remove(id)));
        return {
          affected: results.reduce(
            (sum, result) => sum + result.data.affected,
            0
          ),
        };
      },
      { manual: true }
    );
  };

  const useDeleteMany = () => {
    return useRequest(
      (filter: Record<string, unknown>) =>
        service.deleteMany(filter).then((res) => res.data),
      { manual: true }
    );
  };

  const useSoftDelete = () => {
    return useRequest(
      (filter: Record<string, unknown>) =>
        service.softDelete(filter).then((res) => res.data),
      { manual: true }
    );
  };

  const useRestore = () => {
    return useRequest(
      (filter: Record<string, unknown>) =>
        service.restore(filter).then((res) => res.data),
      { manual: true }
    );
  };

  return {
    useGetPage,
    useGetMany,
    useCount,
    useGetOne,
    useExists,
    useFindById,
    useFindByMa,
    useCreate,
    useUpdate,
    useUpdateMany,
    useRemove,
    useRemoveMany,
    useDeleteMany,
    useSoftDelete,
    useRestore,
  };
}
