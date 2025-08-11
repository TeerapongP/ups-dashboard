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
                'ID',
                'Status',
                'IP Address',
                'Brand',
                'Model',
                'Location',
                'Battery (%)',
                'Battery (VDC)',
                'Backup Time (MIN)',
                'Temp (°C)',
                'Input L1(V)',
                'Input L2(V)',
                'Input L3(V)',
                'Input L1(A)',
                'Input L2(A)',
                'Input L3(A)',
                'Input Frequency(Hz)',
                'Output L1(V)',
                'Output L2(V)',
                'Output L3(V)',
                'Output L1(A)',
                'Output L2(A)',
                'Output L3(A)',
                'Output Frequency(Hz)',
                'Load (VA)',
                'Load (W)',
                'Input Max',
                'Input Min',
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
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ups.id}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      ups.status === 'Online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ups.status}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.ip}
                </td>
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
                  {ups.batteryVDC}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.backupTimeMin}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.temperatureC}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L1V}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L2V}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L3V}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L1A}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L2A}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.L3A}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.input.freqHz}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.L1V}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.L2V}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.L3V}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.L1A}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.L2A}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.L3A}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.output.freqHz}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.loadVA}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.loadW}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.inputMax}
                </td>
                <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ups.inputMin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
