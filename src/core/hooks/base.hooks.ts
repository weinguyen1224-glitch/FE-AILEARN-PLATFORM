import { useRequest } from '@umijs/max';
import type { BaseService } from '../service/base.service';
import {
  AffectedResponse,
  type BaseEntity,
  PageableResponse,
} from '../types/base.types';

export function createBaseHooks<
  TEntity extends BaseEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
>(queryKey: string, service: BaseService<TEntity, TCreateDto, TUpdateDto>) {
  const useGetPage = (options?: any) => {
    return useRequest(() => service.getPage(options));
  };

  const useGetMany = (options?: any) => {
    return useRequest(() => service.getMany(options));
  };

  const useCount = (options?: any) => {
    return useRequest(() => service.count(options));
  };

  const useGetOne = (options?: any) => {
    return useRequest(() => service.getOne(options));
  };

  const useExists = (options?: any) => {
    return useRequest(() => service.exists(options));
  };

  const useFindById = (id: number | undefined) => {
    return useRequest(() => service.findById(id!), { ready: !!id });
  };

  const useFindByMa = (ma: string | undefined) => {
    return useRequest(() => service.findByMa(ma!), { ready: !!ma });
  };

  const useCreate = () => {
    return useRequest((data: TCreateDto) => service.create(data), {
      manual: true,
    });
  };

  const useUpdate = () => {
    return useRequest(
      ({ id, data }: { id: number; data: TUpdateDto }) =>
        service.update(id, data),
      { manual: true },
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
      }) => service.updateMany(filter, data),
      { manual: true },
    );
  };

  const useRemove = () => {
    return useRequest((id: number) => service.remove(id), { manual: true });
  };

  const useRemoveMany = () => {
    return useRequest(
      async (ids: number[]) => {
        const results = await Promise.all(ids.map((id) => service.remove(id)));
        return {
          affected: results.reduce((sum, result) => sum + result.affected, 0),
        };
      },
      { manual: true },
    );
  };

  const useDeleteMany = () => {
    return useRequest(
      (filter: Record<string, unknown>) => service.deleteMany(filter),
      { manual: true },
    );
  };

  const useSoftDelete = () => {
    return useRequest(
      (filter: Record<string, unknown>) => service.softDelete(filter),
      { manual: true },
    );
  };

  const useRestore = () => {
    return useRequest(
      (filter: Record<string, unknown>) => service.restore(filter),
      { manual: true },
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
