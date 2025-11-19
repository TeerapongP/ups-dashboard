'use client';

import { StatusBadgeProps } from '@/types/statusBadgeProps';
import React from 'react';

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    online: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Online',
    },
    powerfail: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'ไฟตก',
    },
    offline: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: 'Offline',
    },
  };

  const key = status?.toLowerCase?.() ?? '';
  const config = statusConfig[key];

  if (!config) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <span className="text-sm font-medium">{status || 'Unknown'}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.text}`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};
