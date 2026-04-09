import type { Request, Response } from 'express';
import type { DanhMuc } from '../types/danh-muc.types';

const danhMucData: DanhMuc[] = [
  {
    id: 1,
    ma: 'DM001',
    stt: 1,
    ten: 'Thời Trang Nữ',
    active: true,
    moTa: 'Các sản phẩm thời trang dành cho nữ',
    maDanhMucCha: undefined,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 2,
    ma: 'DM002',
    stt: 2,
    ten: 'Thời Trang Nam',
    active: true,
    moTa: 'Các sản phẩm thời trang dành cho nam',
    maDanhMucCha: undefined,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 3,
    ma: 'DM003',
    stt: 3,
    ten: 'Điện Thoại & Tablet',
    active: true,
    moTa: 'Các sản phẩm điện thoại và tablet',
    maDanhMucCha: undefined,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 4,
    ma: 'DM004',
    stt: 4,
    ten: 'Laptop & Máy Tính',
    active: true,
    moTa: 'Các sản phẩm laptop và máy tính',
    maDanhMucCha: undefined,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 5,
    ma: 'DM005',
    stt: 5,
    ten: 'Áo Thun Nữ',
    active: true,
    moTa: 'Áo thun dành cho nữ',
    maDanhMucCha: 'DM001',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 6,
    ma: 'DM006',
    stt: 6,
    ten: 'Quần Jeans Nữ',
    active: false,
    moTa: 'Quần jeans dành cho nữ',
    maDanhMucCha: 'DM001',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z',
    deletedAt: undefined,
  },
];

let sourceData = [...danhMucData];

function getDanhMucList(req: Request, res: Response) {
  const params = req.query as any;
  const page = Number(params.page) || 1;
  const size = Number(params.size) || 10;
  const search = params.search?.toLowerCase() || '';

  let filtered = sourceData;
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.ten.toLowerCase().includes(search) ||
        item.ma.toLowerCase().includes(search),
    );
  }

  const start = (page - 1) * size;
  const end = start + size;
  const list = filtered.slice(start, end);

  return res.json({
    data: list,
    total: filtered.length,
    page,
    size,
    totalPages: Math.ceil(filtered.length / size),
  });
}

function getDanhMucAll(req: Request, res: Response) {
  return res.json({
    data: sourceData,
  });
}

function getDanhMucOne(req: Request, res: Response) {
  const params = req.query as any;
  const id = Number(params.id);
  const item = sourceData.find((item) => item.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json({ data: item });
}

function postDanhMuc(req: Request, res: Response) {
  const { body } = req;
  const newItem: DanhMuc = {
    ...body,
    id: sourceData.length + 1,
    ma: `DM${String(sourceData.length + 1).padStart(3, '0')}`,
    stt: sourceData.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined,
  };
  sourceData.unshift(newItem);
  return res.json({ data: newItem });
}

function putDanhMuc(req: Request, res: Response) {
  const { body } = req;
  const { id, ...updateData } = body;
  const index = sourceData.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  sourceData[index] = {
    ...sourceData[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  return res.json({ data: sourceData[index] });
}

function deleteDanhMuc(req: Request, res: Response) {
  const { id } = req.params;
  const index = sourceData.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  sourceData = sourceData.filter((item) => item.id !== Number(id));
  return res.json({ affected: 1 });
}

export default {
  'GET /danh-muc/page': getDanhMucList,
  'GET /danh-muc/all': getDanhMucAll,
  'GET /danh-muc/one': getDanhMucOne,
  'POST /danh-muc': postDanhMuc,
  'PUT /danh-muc': putDanhMuc,
  'DELETE /danh-muc/:id': deleteDanhMuc,
};
