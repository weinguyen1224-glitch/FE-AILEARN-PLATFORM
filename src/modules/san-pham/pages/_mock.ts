import type { Request, Response } from 'express';
import type { SanPham } from '../types/san-pham.types';

const sanPhamData: SanPham[] = [
  {
    id: 1,
    ma: 'SP001',
    stt: 1,
    ten: 'Áo Thun Nam Basic',
    gia: 299000,
    giaSale: 249000,
    moTa: 'Áo thun nam basic form regular',
    urlAnhBia: 'https://via.placeholder.com/300x300?text=Ao+Thun+Nam',
    thuongHieu: 'Generic',
    maDanhMuc: 'DM002',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 2,
    ma: 'SP002',
    stt: 2,
    ten: 'Áo Thun Nữ Polo',
    gia: 399000,
    moTa: 'Áo thun nữ polo phong cách',
    urlAnhBia: 'https://via.placeholder.com/300x300?text=Ao+Thun+Nu',
    thuongHieu: 'Generic',
    maDanhMuc: 'DM001',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 3,
    ma: 'SP003',
    stt: 3,
    ten: 'iPhone 15 Pro Max',
    gia: 32990000,
    giaSale: 29990000,
    moTa: 'Điện thoại iPhone 15 Pro Max 256GB',
    urlAnhBia: 'https://via.placeholder.com/300x300?text=iPhone+15',
    thuongHieu: 'Apple',
    maDanhMuc: 'DM003',
    createdAt: '2024-01-17T08:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 4,
    ma: 'SP004',
    stt: 4,
    ten: 'MacBook Air M3',
    gia: 28990000,
    moTa: 'Laptop MacBook Air M3 15 inch',
    urlAnhBia: 'https://via.placeholder.com/300x300?text=MacBook+Air',
    thuongHieu: 'Apple',
    maDanhMuc: 'DM004',
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 5,
    ma: 'SP005',
    stt: 5,
    ten: 'Quần Jeans Nam Slim',
    gia: 599000,
    giaSale: 499000,
    moTa: 'Quần jeans nam slim fit cao cấp',
    urlAnhBia: 'https://via.placeholder.com/300x300?text=Quan+Jeans+Nam',
    thuongHieu: 'Generic',
    maDanhMuc: 'DM002',
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-19T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 6,
    ma: 'SP006',
    stt: 6,
    ten: 'Samsung Galaxy S24 Ultra',
    gia: 24990000,
    moTa: 'Điện thoại Samsung Galaxy S24 Ultra',
    urlAnhBia: 'https://via.placeholder.com/300x300?text=Galaxy+S24',
    thuongHieu: 'Samsung',
    maDanhMuc: 'DM003',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
    deletedAt: undefined,
  },
];

let sourceData = [...sanPhamData];

function getSanPhamList(req: Request, res: Response) {
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

function getSanPhamAll(req: Request, res: Response) {
  return res.json({
    data: sourceData,
  });
}

function getSanPhamOne(req: Request, res: Response) {
  const params = req.query as any;
  const id = Number(params.id);
  const item = sourceData.find((item) => item.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json({ data: item });
}

function postSanPham(req: Request, res: Response) {
  const { body } = req;
  const newItem: SanPham = {
    ...body,
    id: sourceData.length + 1,
    ma: `SP${String(sourceData.length + 1).padStart(3, '0')}`,
    stt: sourceData.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined,
  };
  sourceData.unshift(newItem);
  return res.json({ data: newItem });
}

function putSanPham(req: Request, res: Response) {
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

function deleteSanPham(req: Request, res: Response) {
  const { id } = req.params;
  const index = sourceData.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  sourceData = sourceData.filter((item) => item.id !== Number(id));
  return res.json({ affected: 1 });
}

export default {
  'GET /san-pham/page': getSanPhamList,
  'GET /san-pham/all': getSanPhamAll,
  'GET /san-pham/one': getSanPhamOne,
  'POST /san-pham': postSanPham,
  'PUT /san-pham': putSanPham,
  'DELETE /san-pham/:id': deleteSanPham,
};
