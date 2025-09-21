'use client';

import React from 'react';
import {  Eye, Edit3, Trash2, MoreVertical, BatteryCharging,  } from 'lucide-react';
import { DeviceTableRowProps } from '@/types/deviceTableRow';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import dayjs from 'dayjs';
import { MapPin } from 'lucide-react';


export const DeviceTableRow: React.FC<DeviceTableRowProps> = ({
  device,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* Status */}
      <td className="px-6 py-6">
        <StatusBadge status={device.status} />
      </td>

      {/* IP Address */}
      <td className="px-6 py-6">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-blue-500" />
          <span className="font-mono text-gray-900 font-medium">{device.ip}</span>
        </div>
      </td>

      {/* Brand */}
      <td className="px-6 py-6">
        <span className="text-gray-900 font-medium">{device.brand}</span>
      </td>

      {/* Model */}
      <td className="px-6 py-6">
        <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono">
          {device.model}
        </span>
      </td>

      {/* Location */}
      <td className="px-6 py-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{device.location}</span>
        </div>
      </td>
      {/* Last Seen */}
      <td className="px-6 py-6">
        <span className="text-sm text-gray-500">
          {device.last_seen
            ? dayjs(device.last_seen).format("DD/MM/YYYY HH:mm:ss")
            : "-"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-6">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onView(device)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
            title="ดูรายละเอียด"
          >
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onEdit(device)}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors group"
            title="แก้ไข"
          >
            <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onDelete(device)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            title="ลบ"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

        </div>
      </td>
    </tr>
  );
};
