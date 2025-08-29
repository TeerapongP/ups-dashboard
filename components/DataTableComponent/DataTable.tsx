'use client';

import { UPSData } from '@/types/ups';

interface DataTableProps {
  upsData: UPSData[];
}

export default function DataTable({ upsData }: DataTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed UPS Data</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {[
                'Brand',
                'Model',
                'Location',
                'Battery (%)',
                'Input L1(V)',
              ].map((header) => (
                <th
                  key={header}
                  className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {upsData.map((ups, index) => (
              <tr key={ups.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.brand}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                  {ups.model}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                  {ups.location}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.batteryPercent}%
                </td>
               
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L1V}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
