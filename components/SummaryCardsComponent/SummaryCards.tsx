'use client';

import { UPSData } from '@/types/ups';

interface SummaryCardsProps {
  upsData: UPSData[];
}

export default function SummaryCards({ upsData }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {upsData.map((ups) => (
        <div
          key={ups.id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-800">{ups.id}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                ups.status === 'Online'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {ups.status}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">IP Address</p>
              <p className="font-semibold text-gray-800">{ups.ip}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Brand</p>
                <p className="font-semibold text-gray-800">{ups.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-semibold text-gray-800 text-xs">{ups.model}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-800">{ups.location}</p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">Battery</p>
                <p className="text-3xl font-bold text-blue-600">{ups.batteryPercent}%</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-lg font-semibold text-orange-600">{ups.temperatureC}°C</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}