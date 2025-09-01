'use client';

import {
  LineChart, Line, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useMemo } from 'react';
import type { UPSData } from '@/types/ups';
import { CustomTooltipProps } from '@/types/TooltipProps';
import { ChartPoint } from '@/types/chartPoint';

type Props = { upsData: UPSData[] };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const tempColor = (t: number) => {
  const v = clamp(t, 0, 60);
  if (v <= 30) {
    const k = v / 30; // 0..1
    const r = Math.round(34 + (234 - 34) * k);
    const g = Math.round(197 + (179 - 197) * k);
    const b = Math.round(94 + (8 - 94) * k);
    return `rgb(${r},${g},${b})`;
  } else {
    const k = (v - 30) / 30; // 0..1
    const r = Math.round(234 + (239 - 234) * k);
    const g = Math.round(179 + (68 - 179) * k);
    const b = Math.round(8 + (68 - 8) * k);
    return `rgb(${r},${g},${b})`;
  }
};

// props สำหรับ dot renderer (หลีกเลี่ยง any)
type DotProps = {
  cx?: number;
  cy?: number;
  value?: number;
};

// วาดจุดธรรมดา (สีตาม temp)
const ColorDot = ({ cx = 0, cy = 0, value = 0 }: DotProps) => {
  const fill = tempColor(Number(value) || 0);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

// วาด active dot (ใหญ่ขึ้น + เงา)
const ActiveColorDot = ({ cx = 0, cy = 0, value = 0 }: DotProps) => {
  const fill = tempColor(Number(value) || 0);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={fill}
      stroke="#fff"
      strokeWidth={3}
      style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))' }}
    />
  );
};

export default function TemperatureLineChart({ upsData }: Props) {
  const chartData: ChartPoint[] = useMemo(
    () =>
      (upsData || []).map((ups) => ({
        id: ups.id,
        name: ups.location || ups.id,
        temp: typeof ups.temperatureC === 'number' ? ups.temperatureC : 0,
      })),
    [upsData]
  );

  // ให้กราฟเลื่อนได้แนวนอนบนมือถือ
  const minWidth = Math.max(chartData.length * 60 + 120, 640);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload?.length) {
      // 👇 cast type ให้รวม payload: ChartPoint
      const p0 = payload[0] as typeof payload[0] & { payload: ChartPoint };
      const t = Number(p0.value ?? 0);

      const deviceIp = p0.payload.id

      const level =
        t <= 20 ? "Cool" :
          t <= 30 ? "Normal" :
            t <= 40 ? "Warm" :
              t <= 50 ? "Hot" : "Critical";

      const levelColor = tempColor(t);

      return (
        <div
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 p-3 min-w-[160px]"
          style={{ WebkitBackdropFilter: "blur(6px)" }}
        >
          <div className="text-xs font-semibold text-gray-800 mb-2">
            IP: {deviceIp}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: levelColor }}
            >
              {level}
            </span>
            <span className="text-gray-600">•</span>
            <span className="font-bold" style={{ color: levelColor }}>
              {t}°C
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/70 rounded-2xl shadow-md border border-gray-100/60 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-sky-500 via-amber-500 to-rose-500" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Temperature (°C)</h3>
            <p className="text-xs sm:text-sm text-gray-500">Per device temperature snapshot</p>
          </div>
        </div>
      </div>

      {/* Scroll container */}
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 24, right: 32, left: 12, bottom: 64 }}>
              <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.7} />

              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
                allowDecimals={false}
                domain={['dataMin - 5', 'dataMax + 5']}
                label={{
                  value: '°C',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px', fontWeight: 600 },
                }}
              />

              <Tooltip<number, string> content={<CustomTooltip />} />

              <defs>
                <linearGradient id="tempStrokeY" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>


              <Line
                type="monotone"
                dataKey="temp"
                stroke="url(#tempStrokeY)"
                strokeWidth={3}
                dot={<ColorDot />}
                activeDot={<ActiveColorDot />}
                name="Temperature"
                connectNulls
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-[11px] sm:text-xs text-gray-500 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <span>Total: {upsData.length} devices</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}
