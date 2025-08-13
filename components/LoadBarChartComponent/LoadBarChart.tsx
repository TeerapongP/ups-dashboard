'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UPSData } from '@/types/ups';

interface LoadBarChartProps {
  upsData: UPSData[];
}

export default function LoadBarChart({ upsData }: LoadBarChartProps) {
  const chartData = upsData.map((ups) => ({
    name: ups.id,
    VA: ups.loadVA,
    W: ups.loadW
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Load Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              `${value} ${name}`,
              name === 'VA' ? 'Load (VA)' : 'Load (W)'
            ]}
          />
          <Legend />
          <Bar 
            dataKey="VA" 
            fill="#8b5cf6" 
            radius={[2, 2, 0, 0]}
            name="Load (VA)"
          />
          <Bar 
            dataKey="W" 
            fill="#f59e0b" 
            radius={[2, 2, 0, 0]}
            name="Load (W)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}