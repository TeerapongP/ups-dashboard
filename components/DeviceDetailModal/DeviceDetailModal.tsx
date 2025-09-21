'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Server } from 'lucide-react';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { DeviceDetailModalProps } from '@/types/deviceDetailModal';

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  device,
  isOpen,
  onClose,
  isDelete,
  onConfirmDelete,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ป้องกัน scroll ด้านหลัง + ปิดด้วย Escape
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  // Last Seen
  const lastSeen = useMemo(() => {
    const v = device?.last_seen;
    if (!v) return '-';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleString();
  }, [device?.last_seen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen || !device) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Device detail"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{device.ip}</h2>
                <p className="text-gray-600">
                  {device.brand} {device.model}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลพื้นฐาน</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">สถานะ</label>
                  <div className="mt-1">
                    <StatusBadge status={device.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">สถานที่</label>
                  <p className="font-medium text-gray-900">{device.location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Seen</label>
                  <p className="font-medium text-gray-900">{lastSeen}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delete section */}
          {isDelete && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-700 mb-4">
                คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  ยืนยันลบ
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
