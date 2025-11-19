'use client';

import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'yellow';
  dotColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, color, dotColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md px-4 py-3 border border-gray-100">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 ${dotColor} rounded-full ${color === 'green' ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm text-gray-600">{label}:</span>
        <span className={`font-bold ${
          color === 'green' ? 'text-green-600' : 
          color === 'red' ? 'text-red-600' : 
          color === 'blue' ? 'text-blue-600' : 
          'text-yellow-600'
        }`}>
          {value}
        </span>
      </div>
    </div>
  );
};