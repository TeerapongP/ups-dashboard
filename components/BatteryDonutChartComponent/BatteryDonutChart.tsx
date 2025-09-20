'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { UPSData } from '@/types/ups';

interface StatusDonutChartProps {
  upsData: UPSData[];
}

export default function StatusDonutChart({ upsData }: StatusDonutChartProps) {
  const onlineCount = upsData.filter((u) => u.status === 'Online').length;
  const offlineCount = upsData.filter((u) => u.status === 'Offline').length;
  const powerfailCount = upsData.filter((u) => u.status === 'PowerFail').length;

  const total = upsData.length || 1; // กันหาร 0

  // ✅ Data สำหรับ PieChart
  const data = [
    { name: 'Online', value: onlineCount },
    { name: 'Offline', value: offlineCount },
    { name: 'Powerfail', value: powerfailCount },
  ];

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b']; // เขียว / แดง / เหลือง

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        UPS Status Overview
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* แสดงจำนวนรวมตรงกลาง */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-600">Total UPS</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">
            Online ({((onlineCount / total) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">
            Offline ({((offlineCount / total) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">
            Powerfail ({((powerfailCount / total) * 100).toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
