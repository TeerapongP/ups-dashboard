"use client";

import { useMemo, useState } from "react";
import { UPSData } from "@/types/ups";
import { useAuth } from "@/context/AuthContext";

interface DataTableProps {
  upsData: UPSData[];
}

/** แปลง IPv4 เป็นตัวเลข 4 ช่องสำหรับเปรียบเทียบ (รองรับ null/ว่าง/รูปแบบเพี้ยน) */
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

/** เปรียบเทียบ IP สองตัว */
function compareIp(a?: string, b?: string) {
  const A = ipToQuads(a);
  const B = ipToQuads(b);
  for (let i = 0; i < 4; i++) {
    if (A[i] < B[i]) return -1;
    if (A[i] > B[i]) return 1;
  }
  return 0;
}

export default function DataTable({ upsData }: DataTableProps) {
  const { loggedIn } = useAuth();
  const [asc] = useState(true);

  // เรียงตาม IP (สลับทิศทางได้ด้วยปุ่ม)
  const sortedData = useMemo(() => {
    const copied = [...(upsData || [])];
    copied.sort((a, b) => (asc ? compareIp(a.ip, b.ip) : compareIp(b.ip, a.ip)));
    return copied;
  }, [upsData, asc]);

  const headers = loggedIn
    ? [
      "ID",
      "Status",
      "IP Address",
      "Brand",
      "Model",
      "Location",
      "Input L1(V)",
      "Input L2(V)",
      "Input L3(V)",
      "Battery (%)",
      "Battery (VDC)",
      "Backup Time (MIN)",
      "Temp (°C)",

      "Input L1(A)",
      "Input Frequency(Hz)",
      "Output L1(V)",
      "Output L2(V)",
      "Output L3(V)",
      "Output L1(A)",
      "Output L2(A)",
      "Output L3(A)",
      "Output Frequency(Hz)",
      "Load (VA)",
      "Load (W)",
    ]
    : ["Brand", "Model", "Location", "Battery (%)", "Input L1(V)"];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-bold text-gray-800">Detailed UPS Data</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header) => (
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
            {sortedData.map((ups, index) => (
              <tr key={ups.id ?? `${ups.ip}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {loggedIn ? (
                  <>
                    {/* ✅ จัดคอลัมน์ให้ตรงกับ headers */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ups.id}
                    </td>

                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${ups.status === "Online"
                          ? "bg-green-100 text-green-800"
                          : ups.status === "Offline"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
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
                      {ups.input?.L1V}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.input?.L2V}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.input?.L3V}
                    </td>
                    {/* Battery */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.batteryPercent}%
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {ups.batteryVDC != null ? (ups.batteryVDC / 10).toFixed(1) : "-"}
                    </td>

                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.backupTimeMin}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.temperatureC}
                    </td>

                    {/* Input V */}


                    {/* Input A */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.input?.L1A}
                    </td>
                    {/* Input Frequency */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.input?.freqHz}
                    </td>

                    {/* Output V */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.L1V}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.L2V}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.L3V}
                    </td>

                    {/* Output A */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.L1A}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.L2A}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.L3A}
                    </td>

                    {/* Output Frequency */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.output?.freqHz}
                    </td>

                    {/* Load */}
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.loadVA}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ups.loadW}
                    </td>
                  </>
                ) : (
                  <>
                    {/* 🔒 โหมดไม่ล็อกอิน: โชว์เฉพาะ 5 คอลัมน์ */}
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
                      {ups.input?.L1V}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
