'use client';

import BatteryDonutChart from '@/components/BatteryDonutChartComponent/BatteryDonutChart';
import DataTable from '@/components/DataTableComponent/DataTable';
import LoadBarChart from '@/components/TemperatureLineChart/TemperatureLineChart';
import VoltageLineChart from '@/components/VoltageLineChartComponent/VoltageLineChart';
import Toast from '@/components/ToastComponent/Toast';
import NavBar from '@/components/NavBarComponent/NavBar';
import Loading from '@/components/LoadingComponent/Loading';
import GroupedSummaryCards from '@/components/GroupedSummaryCardsGroupComponent/GroupedSummaryCardsGroup';
import SearchFilter from '@/components/SearchFilterComponent/SearchFilter';

import { useAuth } from '@/context/AuthContext';
import { useUpsPolling } from '@/hooks/useUpsPolling';

import type { UPSData } from '@/types/ups';
import { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from 'react';

function normalizeStatus(s?: string): string {
  const v = (s ?? '').trim().toLowerCase();
  if (v === 'online') return 'Online';
  if (v === 'offline') return 'Offline';
  if (v === 'powerfail' || v === 'power_fail' || v === 'power-fail') return 'PowerFail';
  if (v === 'powercut' || v === 'power_cut' || v === 'power-cut') return 'powerCut';
  return '';
}

export default function UPSDashboard() {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const [filteredData, setFilteredData] = useState<UPSData[]>([]);
  const [groupBy, setGroupBy] = useState<string>('none');

  const { loggedIn } = useAuth();

  const requestUrl = useMemo(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_URL ?? "";

    // ตัด/เติมให้เหลือ api base แค่รอบเดียว
    const trimmed = rawBase.replace(/\/+$/, ""); // ตัด trailing slash
    const apiBase = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;

    const qs = "timeout=1&retries=0&workers=12&ttl=2&persist=true";
    const endpoint = "ups-getall";

    // ถ้าไม่ตั้ง NEXT_PUBLIC_API_URL ให้ fallback ไปใช้ Next API route
    if (!rawBase) return `/api/${endpoint}?${qs}`;

    return `${apiBase}/${endpoint}?${qs}`;
  }, []);


  const { upsData, loading, error } = useUpsPolling(requestUrl, 30000);

  // ====== First load + filter handling ======
  const firstLoadRef = useRef(true);
  useEffect(() => {
    if (upsData?.length) {
      setFilteredData(upsData);
      if (firstLoadRef.current) {
        setGroupBy('none');
        firstLoadRef.current = false;
      }
    } else {
      setFilteredData([]);
    }
  }, [upsData]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  // ====== Status transition detection (Online / Offline / PowerFail) ======
  const prevStatusMapRef = useRef<Record<string, string>>({});
  const lastToastAtRef = useRef<number>(0);
  const TOAST_COOLDOWN_MS = 2500; // กันสแปมเล็กน้อย

  useEffect(() => {
    if (!upsData?.length) return;

    // --- helper ---
    const norm = (s: unknown) =>
      String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s_\-]+/g, ""); // ตัดช่องว่าง/ขีด/ขีดล่าง

    const normalizeStatus = (s: unknown): "Online" | "Offline" | "PowerFail" | "powerCut" | "" => {
      const k = norm(s);
      if (k === "online") return "Online";
      if (k === "offline") return "Offline";
      // รองรับ power-fail หลายรูปแบบ
      if (k === "powerfail" || k === "powerfailure" || k === "acfail" || (k.includes("power") && k.includes("fail")))
        return "PowerFail";
      // รองรับ power-cut หลายรูปแบบ
      if (k === "powercut" || k === "poweroutage" || (k.includes("power") && (k.includes("cut") || k.includes("outage"))))
        return "powerCut";
      return "";
    };

    const formatNames = (ids: string[]) => `${ids.slice(0, 3).join(", ")}${ids.length > 3 ? "…" : ""}`;

    // --- สถานะก่อนหน้า / รอบแรก ---
    const prevMap = prevStatusMapRef.current as Record<string, string | undefined>;
    const isFirstTick = Object.keys(prevMap).length === 0;

    // --- เก็บ map ใหม่ ---
    const newMap: Record<string, string> = {};

    // --- ชุดข้อมูล event/ภาพรวม ---
    const outages: string[] = [];      // Online -> Offline
    const recovered: string[] = [];    // Offline -> Online
    const powerFails: string[] = [];   // any -> PowerFail (เพิ่งเปลี่ยน)
    const powerCuts: string[] = []; // any -> powerCut (เพิ่งเปลี่ยน)

    const currentOffline: string[] = [];     // สรุปรอบแรก
    const currentPowerFail: string[] = [];   // สรุปรอบแรก
    const currentPowerCut: string[] = []; // สรุปรอบแรก

    for (const u of upsData) {
      const prev = normalizeStatus(prevMap[u.id]);
      const curr = normalizeStatus(u.status);
      newMap[u.id] = curr;

      // ภาพรวมรอบแรก
      if (curr === "Offline") currentOffline.push(u.id);
      if (curr === "PowerFail") currentPowerFail.push(u.id);
      if (curr === "powerCut") currentPowerCut.push(u.id);

      // ข้าม transition ถ้ายังไม่มี prev (จะสรุปรอบแรกแทน)
      if (!prev) continue;

      if (prev === "Online" && curr === "Offline") outages.push(u.id);
      else if (prev === "Offline" && curr === "Online") recovered.push(u.id);
      else if (curr === "PowerFail" && prev !== "PowerFail") powerFails.push(u.id);
      else if (curr === "powerCut" && prev !== "powerCut") powerCuts.push(u.id);
    }

    // --- สร้างคิวตาม priority ---
    type ToastItem = { type: "error" | "warning" | "success"; msg: string };
    const queue: ToastItem[] = [];

    if (isFirstTick) {
      if (currentOffline.length > 0) {
        queue.push({
          type: "error",
          msg: `ยัง Offline อยู่ ${currentOffline.length} จุด: ${formatNames(currentOffline)}`,
        });
      }
      if (currentPowerFail.length > 0) {
        queue.push({
          type: "warning",
          msg: `ไฟตก ${currentPowerFail.length} จุด: ${formatNames(currentPowerFail)}`,
        });
      }
      if (currentPowerCut.length > 0) {
        queue.push({
          type: "warning",
          msg: `ไฟดับ ${currentPowerCut.length} จุด: ${formatNames(currentPowerCut)}`,
        });
      }
    } else {
      if (outages.length > 0) {
        queue.push({
          type: "error",
          msg: `ติดต่อ UPS ไม่ได้ ${outages.length} จุด: ${formatNames(outages)}`,
        });
      }
      if (powerFails.length > 0) {
        queue.push({
          type: "warning",
          msg: `ไฟตก ${powerFails.length} จุด: ${formatNames(powerFails)}`,
        });
      }
      if (powerCuts.length > 0) {
        queue.push({
          type: "warning",
          msg: `ไฟดับ ${powerCuts.length} จุด: ${formatNames(powerCuts)}`,
        });
      }
      if (recovered.length > 0) {
        queue.push({
          type: "success",
          msg: `ไฟกลับมาแล้ว ${recovered.length} จุด: ${formatNames(recovered)}`,
        });
      }
    }

    const now = Date.now();
    const canToast = now - lastToastAtRef.current >= TOAST_COOLDOWN_MS;

    // ถ้าไม่มีอะไรจะแจ้ง ก็อัปเดต prev แล้วจบ
    if (queue.length === 0) {
      prevStatusMapRef.current = newMap;
      return;
    }

    // แสดงหลายอัน "ทยอย" ตาม cooldown
    const showToast = (item: ToastItem) => {
      setToastType(item.type);
      setToastMessage(item.msg);
      setShowToast(true);
      lastToastAtRef.current = Date.now();
    };

    if (canToast) {
      // โชว์อันแรกทันที
      showToast(queue[0]);

      // ถ้ามีมากกว่า 1 รายการ ให้ทยอยโชว์ตาม TOAST_COOLDOWN_MS
      if (queue.length > 1) {
        // สร้างห่วงโซ่ setTimeout แบบต่อคิว
        let delay = TOAST_COOLDOWN_MS;
        for (let i = 1; i < queue.length; i++) {
          setTimeout(() => showToast(queue[i]), delay);
          delay += TOAST_COOLDOWN_MS;
        }
      }
    }
    // อัปเดต prev เสมอ
    prevStatusMapRef.current = newMap;
  }, [upsData]);


  const handleFilter = useCallback((filtered: UPSData[], groupByValue: string) => {
    setFilteredData(filtered);
    setGroupBy(groupByValue);
  }, []);

  const deferredFiltered = useDeferredValue(filteredData);

  if (loading) return <Loading />;

  const totalCount = upsData.length;
  const onlineCount = upsData.filter(u => normalizeStatus(u.status) === 'Online').length;
  const offlineCount = upsData.filter(u => normalizeStatus(u.status) === 'Offline').length;
  const powerFailCount = upsData.filter(u => normalizeStatus(u.status) === 'PowerFail').length;
  const powerCutCount = upsData.filter(u => normalizeStatus(u.status) === 'powerCut').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <SearchFilter upsData={upsData} onFilter={handleFilter} />

      <GroupedSummaryCards upsData={deferredFiltered} groupBy={groupBy} />

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {loggedIn ? (
            <>

              <BatteryDonutChart upsData={upsData} />
              <VoltageLineChart upsData={upsData} />
            </>
          ) : (
            <div />
          )}
        </div>

        {loggedIn ? (
          <div className="mb-6">
            <LoadBarChart upsData={upsData} />
          </div>
        ) : (
          <div />
        )}
      </div>

      <DataTable upsData={upsData} />

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-full px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div>© 2025 UPS Monitoring Dashboard. All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 md:mt-0">
              <span>Total: {totalCount}</span>
              <span>•</span>
              <span>Online: {onlineCount}</span>
              <span>•</span>
              <span>Offline: {offlineCount}</span>
              <span>•</span>
              <span>ไฟตก: {powerFailCount}</span>
              <span>•</span>
              <span>ไฟดับ: {powerCutCount}</span>
            </div>
          </div>
        </div>
      </footer>

      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Toast
            toast={{
              id: 'dashboardToast',
              message: toastMessage,
              type: toastType,
              duration: 4000,
            }}
            onRemove={(id: string) => {
              if (id === 'dashboardToast') setShowToast(false);
            }}
          />
        </div>
      )}
    </div>
  );
}