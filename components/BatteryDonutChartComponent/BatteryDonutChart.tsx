'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { UPSData } from '@/types/ups';

interface BatteryDonutChartProps {
  upsData: UPSData[];
}

export default function BatteryDonutChart({ upsData }: BatteryDonutChartProps) {
  const avgBattery = Math.round(
    upsData.reduce((sum, ups) => sum + ups.batteryPercent, 0) / upsData.length
  );

  const data = [
    { name: 'Battery', value: avgBattery },
    { name: 'Remaining', value: 100 - avgBattery }
  ];

  const COLORS = ['#22c55e', '#f3f4f6'];


  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Average Battery Level</h3>
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{avgBattery}%</div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Battery Level</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Remaining</span>
        </div>
      </div>
    </div>
  );
}