'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { UPSData } from '@/types/ups';

interface VoltageLineChartProps {
  upsData: UPSData[];
}

type Point = {
  name: string; // ใช้เป็น label บนแกน X (เช่น ups.id หรือ location)
  L1: number;
  index: number;
};

export default function VoltageLineChart({ upsData }: VoltageLineChartProps) {
  const chartData: Point[] = useMemo(
    () =>
      upsData.map((ups, index) => ({
        name: ups.id,   // ถ้าอยากใช้ location เปลี่ยนเป็น ups.location ?? ups.id
        L1: Number(ups.input.L1V ?? 0),
        index
      })),
    [upsData]
  );

  const [isSmall, setIsSmall] = useState(false);   // <640px
  const [isMedium, setIsMedium] = useState(false); // >=640px && <1024px

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsSmall(w < 640);
      setIsMedium(w >= 640 && w < 1024);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // มือถือ: 80px ต่อจุด, จอใหญ่: 60px ต่อจุด
  const perPointPx = isSmall ? 80 : 60;
  const minWidth = Math.max(chartData.length * perPointPx + 160, 600);

  const chartHeightCls = isSmall ? 'h-[260px]' : isMedium ? 'h-[320px]' : 'h-[360px]';

  const xTickAngle = isSmall ? 0 : -35;
  const xHeight = isSmall ? 40 : 70;
  const xInterval = isSmall ? 'preserveStartEnd' : 0; // มือถือโชว์หัว-ท้ายพอ

  const xTickFormatter = (v: string) => (isSmall ? (v?.length > 8 ? v.slice(0, 8) + '…' : v) : v);

  const dotR = isSmall ? 3.5 : 5;
  const activeDotR = isSmall ? 5.5 : 7;
  const lineStrokeWidth = isSmall ? 2.5 : 3;

  // ✅ Tooltip component (type-safe)
  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-2xl p-3 sm:p-4 min-w-[130px]">
          <div className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 border-b border-gray-100 pb-2">
            UPS: {label}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500" />
            <span className="text-xs sm:text-sm text-gray-600">L1 Voltage:</span>
            <span className="text-xs sm:text-sm font-bold text-red-600">{payload[0].value}V</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-100/50 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-1 sm:mb-2">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full" />
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Input Line Voltage (L1)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-2 sm:ml-4">
          Real-time voltage monitoring across UPS units
        </p>
      </div>

      {/* Scroll container + responsive height */}
      <div className={`relative overflow-x-auto ${chartHeightCls}`}>
        <div style={{ minWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: isSmall ? 14 : 20,
                right: isSmall ? 16 : 40,
                left: isSmall ? 12 : 20,
                bottom: isSmall ? 36 : 60
              }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
                horizontal
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                angle={xTickAngle}
                textAnchor={isSmall ? 'middle' : 'end'}
                height={xHeight}
                tick={{ fill: '#6b7280' }}
                interval={xInterval as any} // interval typing accepts number | 'preserveStartEnd'
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickFormatter={xTickFormatter}
              />

              <YAxis
                stroke="#6b7280"
                fontSize={11}
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

              <Tooltip content={<CustomTooltip />} />

              {/* ซ่อน legend บนจอเล็ก */}
              {!isSmall && (
                <Legend
                  wrapperStyle={{
                    paddingTop: 20,
                    fontSize: 13,
                    fontWeight: 500
                  }}
                />
              )}

              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              <Line
                type="monotone"
                dataKey="L1"
                stroke="url(#lineGradient)"
                strokeWidth={lineStrokeWidth}
                dot={{
                  fill: '#ef4444',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  r: dotR,
                  filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.35))'
                }}
                activeDot={{
                  r: activeDotR,
                  fill: '#ef4444',
                  stroke: '#ffffff',
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))'
                }}
                name="L1 Voltage"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-500 border-t border-gray-100 pt-3 sm:pt-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span>Total UPS Units: {upsData.length}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live Data</span>
        </div>
      </div>
    </div>
  );
}
