'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UPSData } from '@/types/ups';

interface VoltageLineChartProps {
  upsData: UPSData[];
}

export default function VoltageLineChart({ upsData }: VoltageLineChartProps) {
  const chartData = upsData.map((ups, index) => ({
    name: ups.id,
    L1: ups.input.L1V,
    index
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-2xl p-4 min-w-[140px]">
          <div className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-100 pb-2">
            UPS: {label}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
            <span className="text-sm text-gray-600">L1 Voltage:</span>
            <span className="text-sm font-bold text-red-600">{payload[0].value}V</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-100/50 p-8 backdrop-blur-sm">
      {/* Header with gradient accent */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full"></div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Input Line Voltage (L1)
          </h3>
        </div>
        <p className="text-sm text-gray-500 ml-4">Real-time voltage monitoring across UPS units</p>
      </div>

      {/* Chart container with improved styling */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={chartData} 
            margin={{ top: 20, right: 40, left: 20, bottom: 60 }}
          >
            {/* Enhanced grid */}
            <CartesianGrid 
              strokeDasharray="2 4" 
              stroke="#e5e7eb" 
              strokeOpacity={0.6}
              horizontal={true}
              vertical={false}
            />
            
            {/* Styled X-axis */}
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={11}
              fontWeight={500}
              angle={-35}
              textAnchor="end"
              height={70}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            />
            
            {/* Styled Y-axis */}
            <YAxis 
              stroke="#6b7280"
              fontSize={11}
              fontWeight={500}
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              label={{ 
                value: 'Voltage (V)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px', fontWeight: 500 }
              }}
            />
            
            {/* Custom tooltip */}
            <Tooltip content={<CustomTooltip />} />
            
            {/* Styled legend */}
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: 500
              }}
            />
            
            {/* Enhanced line with gradient and glow effect */}
            <Line 
              type="monotone" 
              dataKey="L1" 
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ 
                fill: '#ef4444', 
                strokeWidth: 3,
                stroke: '#ffffff',
                r: 5,
                filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))'
              }}
              activeDot={{ 
                r: 7,
                fill: '#ef4444',
                stroke: '#ffffff',
                strokeWidth: 3,
                filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
              }}
              name="L1 Voltage"
              connectNulls={false}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          <span>Total UPS Units: {upsData.length}</span>
          <span>•</span>
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>
    </div>
  );
}