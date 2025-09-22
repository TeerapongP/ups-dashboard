'use client';

import React from 'react';
import { Server, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardHeaderProps } from '@/types/dashboardHeader';
import { StatsCard } from '../StatsCard/StatsCard';



export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ devices }) => {
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const powerFailCount = devices.filter(d => d.status === 'powerFail').length;


  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
            <Server className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">จัดการอุปกรณ์ UPS ทั้งหมด</p>
          </div>
        </div>

        <div className="flex gap-4">
          <StatsCard
            label="Online"
            value={onlineCount}
            color="green"
            dotColor="bg-green-500"
          />
          <StatsCard
            label="Power Fail"
            value={powerFailCount}
            color="yellow"
            dotColor="bg-yellow-500"
          />
          <StatsCard
            label="Offline"
            value={offlineCount}
            color="red"
            dotColor="bg-red-500"
          />
        </div>
      </div>
    </div>
  );
};