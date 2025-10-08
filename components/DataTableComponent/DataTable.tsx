"use client";

import { useMemo, useState } from "react";
import { UPSData } from "@/types/ups";
import { useAuth } from "@/context/AuthContext";

interface DataTableProps {
  upsData: UPSData[];
}

type Cell<T> = (row: T) => React.ReactNode;

export default function DataTable({ upsData }: DataTableProps) {
  const { loggedIn } = useAuth();
  const [asc] = useState(true);

  /** แปลง IPv4 เป็นตัวเลข 4 ช่อง */
  function ipToQuads(ip?: string): [number, number, number, number] {
    if (!ip) return [0, 0, 0, 0];
    const parts = ip.split(".").slice(0, 4);
    const nums = parts.map((p) => {
      const n = parseInt(p, 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    }) as number[];
    while (nums.length < 4) nums.push(0);
    return [nums[0], nums[1], nums[2], nums[3]] as [number, number, number, number];
  }

  /** เปรียบเทียบ IP */
  function compareIp(a?: string, b?: string) {
    const A = ipToQuads(a);
    const B = ipToQuads(b);
    for (let i = 0; i < 4; i++) {
      if (A[i] < B[i]) return -1;
      if (A[i] > B[i]) return 1;
    }
    return 0;
  }

  const sortedData = useMemo(() => {
    const copied = [...(upsData || [])];
    copied.sort((a, b) => (asc ? compareIp(a.ip, b.ip) : compareIp(b.ip, a.ip)));
    return copied;
  }, [upsData, asc]);

  /** กำหนดคอลัมน์ */
  const allColumns: { header: string; cell: (u: UPSData) => React.ReactNode }[] = [
    { header: "ID", cell: (u) => u.id },
    {
      header: "Status",
      cell: (u) => {
        // ✅ ปรับให้รองรับ power_outage จาก BE ด้วย
        const normalizedStatus = (u.status ?? "").toLowerCase();

        const statusText =
          normalizedStatus === "online"
            ? "ออนไลน์"
            : normalizedStatus === "offline"
              ? "ออฟไลน์"
              : normalizedStatus === "powerfail"
                ? "ไฟตก"
                : normalizedStatus === "power_outage"
                  ? "ไฟดับ"
                  : u.status ?? "-";

        const statusColor =
          normalizedStatus === "online"
            ? "bg-green-100 text-green-800"
            : normalizedStatus === "offline"
              ? "bg-red-100 text-red-800"
              : normalizedStatus === "powerfail" || normalizedStatus === "power_outage"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-700";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
          >
            {statusText}
          </span>
        );
      },
    },
    { header: "IP Address", cell: (u) => u.ip },
    { header: "Brand", cell: (u) => u.brand },
    { header: "Model", cell: (u) => u.model },
    { header: "Location", cell: (u) => u.location },
    { header: "Input L1(V)", cell: (u) => u.input?.L1V ?? 0 },
    { header: "Input L2(V)", cell: (u) => u.input?.L2V ?? 0 },
    { header: "Input L3(V)", cell: (u) => u.input?.L3V ?? 0 },
    { header: "Battery (%)", cell: (u) => `${u.batteryPercent ?? 0}%` },
    {
      header: "Battery (VDC)",
      cell: (u) => (u.batteryVDC != null ? (u.batteryVDC / 10).toFixed(1) : 0),
    },
    { header: "Backup Time (MIN)", cell: (u) => u.backupTimeMin ?? 0 },
    { header: "Temp (°C)", cell: (u) => u.temperatureC ?? 0 },
    {
      header: "Input L1(A)",
      cell: (u) => (u.input?.L1A != null && u.input.L1A >= 0 ? u.input.L1A : 0),
    },
    { header: "Input Frequency(Hz)", cell: (u) => u.input?.freqHz ?? 0 },
    { header: "Output L1(V)", cell: (u) => u.output?.L1V ?? 0 },
    { header: "Output L2(V)", cell: (u) => u.output?.L2V ?? 0 },
    { header: "Output L3(V)", cell: (u) => u.output?.L3V ?? 0 },
    { header: "Output L1(A)", cell: (u) => u.output?.L1A ?? 0 },
    { header: "Output L2(A)", cell: (u) => u.output?.L2A ?? 0 },
    { header: "Output L3(A)", cell: (u) => u.output?.L3A ?? 0 },
    { header: "Output Frequency(Hz)", cell: (u) => u.output?.freqHz ?? 0 },
    { header: "Load (VA)", cell: (u) => u.loadVA ?? 0 },
    { header: "Load (W)", cell: (u) => u.loadW ?? 0 },
  ];
  
  const guestColumns: { header: string; cell: Cell<UPSData> }[] = [
    { header: "Brand", cell: (u) => u.brand },
    { header: "Model", cell: (u) => u.model },
    { header: "Location", cell: (u) => u.location },
    { header: "Input L1(V)", cell: (u) => u.input?.L1V ?? 0 },
    { header: "Battery (%)", cell: (u) => `${u.batteryPercent ?? 0}%` },
  ];

  const columns = loggedIn ? allColumns : guestColumns;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-bold text-gray-800">Detailed UPS Data</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((ups, index) => (
              <tr
                key={ups.id ?? `${ups.ip}-${index}`}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                  >
                    {col.cell(ups)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
