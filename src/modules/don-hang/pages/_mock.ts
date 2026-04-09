import type { Request, Response } from 'express';
import type { DonHang } from '../types/don-hang.types';

const donHangData: DonHang[] = [
  {
    id: 1,
    ma: 'DH001',
    stt: 1,
    tenNguoiNhan: 'Nguyễn Văn A',
    diaChi: '123 Nguyễn Trãi, Quận 1, TP.HCM',
    soDienThoai: '0909123456',
    tongTien: 599000,
    trangThai: 'DANG_XU_LY',
    trangThaiThanhToan: 'DANG_XU_LY',
    hinhThucThanhToan: 'COD',
    maUser: 'USR001',
    maGioHang: 'GH001',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    deletedAt: undefined,
  },
  {
    id: 2,
    ma: 'DH002',
    stt: 2,
    tenNguoiNhan: 'Trần Thị B',
    diaChi: '456 Lê Lợi, Quận 3, TP.HCM',
    soDienThoai: '0912345678',
    tongTien: 32990000,
    trangThai: 'DANG_GIAO',
    trangThaiThanhToan: 'DA_THANH_TOAN',
    hinhThucThanhToan: 'Banking',
    maUser: 'USR002',
    maGioHang: 'GH002',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-17T08:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 3,
    ma: 'DH003',
    stt: 3,
    tenNguoiNhan: 'Lê Minh C',
    diaChi: '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    soDienThoai: '0933123456',
    tongTien: 898000,
    trangThai: 'HOAN_THANH',
    trangThaiThanhToan: 'DA_THANH_TOAN',
    hinhThucThanhToan: 'COD',
    maUser: 'USR003',
    maGioHang: 'GH003',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 4,
    ma: 'DH004',
    stt: 4,
    tenNguoiNhan: 'Phạm Thị D',
    diaChi: '321 Võ Văn Ngân, Quận Thủ Đức, TP.HCM',
    soDienThoai: '0944567890',
    tongTien: 249000,
    trangThai: 'HUY',
    trangThaiThanhToan: 'CHUA_THANH_TOAN',
    hinhThucThanhToan: 'COD',
    maUser: 'USR004',
    maGioHang: 'GH004',
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    deletedAt: undefined,
  },
  {
    id: 5,
    ma: 'DH005',
    stt: 5,
    tenNguoiNhan: 'Hoàng Văn E',
    diaChi: '654 Nguyễn Oanh, Quận Gò Vấp, TP.HCM',
    soDienThoai: '0955678901',
    tongTien: 28990000,
    trangThai: 'DANG_XU_LY',
    trangThaiThanhToan: 'DANG_XU_LY',
    hinhThucThanhToan: 'Banking',
    maUser: 'USR005',
    maGioHang: 'GH005',
    createdAt: '2024-01-19T08:30:00Z',
    updatedAt: '2024-01-19T08:30:00Z',
    deletedAt: undefined,
  },
];

let sourceData = [...donHangData];

function getDonHangList(req: Request, res: Response) {
  const params = req.query as any;
  const page = Number(params.page) || 1;
  const size = Number(params.size) || 10;
  const search = params.search?.toLowerCase() || '';

  let filtered = sourceData;
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.tenNguoiNhan.toLowerCase().includes(search) ||
        item.ma.toLowerCase().includes(search) ||
        item.soDienThoai.includes(search),
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

function getDonHangAll(req: Request, res: Response) {
  return res.json({
    data: sourceData,
  });
}

function getDonHangOne(req: Request, res: Response) {
  const params = req.query as any;
  const id = Number(params.id);
  const item = sourceData.find((item) => item.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json({ data: item });
}

function postDonHang(req: Request, res: Response) {
  const { body } = req;
  const newItem: DonHang = {
    ...body,
    id: sourceData.length + 1,
    ma: `DH${String(sourceData.length + 1).padStart(3, '0')}`,
    stt: sourceData.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined,
  };
  sourceData.unshift(newItem);
  return res.json({ data: newItem });
}

function putDonHang(req: Request, res: Response) {
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

function deleteDonHang(req: Request, res: Response) {
  const { id } = req.params;
  const index = sourceData.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  sourceData = sourceData.filter((item) => item.id !== Number(id));
  return res.json({ affected: 1 });
}

export default {
  'GET /don-hang/page': getDonHangList,
  'GET /don-hang/all': getDonHangAll,
  'GET /don-hang/one': getDonHangOne,
  'POST /don-hang': postDonHang,
  'PUT /don-hang': putDonHang,
  'DELETE /don-hang/:id': deleteDonHang,
};
