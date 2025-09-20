'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Server, Plus } from 'lucide-react';
import { DeviceTableProps } from '@/types/deviceTable';
import { DeviceTableRow } from '../DeviceTableRow/DeviceTableRow';

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  totalDevices,
  onViewDevice,
  onEditDevice,
  onDeleteDevice,
  onAddDevice,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return devices.slice(start, start + pageSize);
  }, [devices, currentPage]);

  // คำนวณจำนวนหน้า (ใช้จำนวนหลังกรอง)
  const totalPages = Math.max(1, Math.ceil(devices.length / pageSize));

  // สร้างเลขหน้าพร้อม ... ย่อ
  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | '...')[] = [];
    const add = (p: number | '...') => pages.push(p);

    const window = 1; // แสดงรอบๆ หน้าปัจจุบัน +/-1

    if (total <= 7) {
      for (let i = 1; i <= total; i++) add(i);
      return pages;
    }

    add(1);
    if (current > 2 + window) add('...');
    for (let i = Math.max(2, current - window); i <= Math.min(total - 1, current + window); i++) add(i);
    if (current < total - (1 + window)) add('...');
    add(total);

    return pages;
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          อุปกรณ์ทั้งหมด ({devices.length})
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สถานะ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">IP Address</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Brand</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Seen</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedDevices.map((device) => (
              <DeviceTableRow
                key={device.ups_id}
                device={device}
                onView={onViewDevice}
                onEdit={onEditDevice}
                onDelete={onDeleteDevice}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {devices.length === 0 && (
        <div className="text-center py-12">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบอุปกรณ์</h3>
          <p className="text-gray-500 mb-4">ไม่มีอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหา</p>
          <button
            onClick={onAddDevice}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            เพิ่มอุปกรณ์ใหม่
          </button>
        </div>
      )}

      {/* Pagination */}
      {devices.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              แสดง{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, devices.length)}
              </span>{" "}
              จาก{" "}
              <span className="font-medium">{devices.length}</span> รายการ
              <span className="ml-2 text-gray-500">
                (หน้า {currentPage} จาก {totalPages})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                ก่อนหน้า
              </button>

              {pageNumbers.map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 text-sm rounded ${p === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
