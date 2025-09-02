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
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    const qs = 'timeout=1&retries=0&workers=12&ttl=2';
    return `${base ? `${base}/ups` : '/api/ups'}?${qs}`;
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

    const prevMap = prevStatusMapRef.current;
    const isFirstTick = Object.keys(prevMap).length === 0; // ยังไม่เคยมีสถานะเก่า

    const newMap: Record<string, string> = {};

    const outages: string[] = [];    // Online -> Offline
    const recovered: string[] = [];  // Offline -> Online
    const powerFails: string[] = []; // any -> PowerFail (เฉพาะเมื่อเพิ่งเปลี่ยน)

    const currentOffline: string[] = [];   // สรุปภาพรวมปัจจุบัน (ใช้รอบแรก)
    const currentPowerFail: string[] = [];

    for (const u of upsData) {
      const prev = normalizeStatus(prevMap[u.id]);
      const curr = normalizeStatus(u.status);
      newMap[u.id] = curr;

      // เก็บภาพรวมปัจจุบัน
      if (curr === 'Offline') currentOffline.push(u.id);
      if (curr === 'PowerFail') currentPowerFail.push(u.id);

      // หากยังไม่มีสถานะก่อนหน้า ให้ข้าม transition (จะสรุปรอบแรกด้านล่าง)
      if (!prev) continue;

      if (prev === 'Online' && curr === 'Offline') outages.push(u.id);
      else if (prev === 'Offline' && curr === 'Online') recovered.push(u.id);
      else if (curr === 'PowerFail' && prev !== 'PowerFail') powerFails.push(u.id);
    }

    const formatNames = (ids: string[]) => `${ids.slice(0, 3).join(', ')}${ids.length > 3 ? '…' : ''}`;

    const now = Date.now();
    const canToast = now - lastToastAtRef.current >= TOAST_COOLDOWN_MS;

    // Queue ตามความสำคัญ: error > warning > success
    const queue: Array<{ type: 'error' | 'warning' | 'success'; msg: string; cond: boolean }> = [];

    if (isFirstTick) {
      // รอบแรก: ยังไม่มี prev → แสดงภาพรวมสถานะที่มีอยู่ตอนนี้เลย
      queue.push(
        { type: 'error', msg: `ยัง Offline อยู่ ${currentOffline.length} จุด: ${formatNames(currentOffline)}`, cond: currentOffline.length > 0 },
        { type: 'warning', msg: `ไฟตก/ไฟต่ำ ${currentPowerFail.length} จุด: ${formatNames(currentPowerFail)}`, cond: currentPowerFail.length > 0 },
      );
    } else {
      // รอบถัดไป: แสดงเฉพาะเมื่อมีการเปลี่ยนสถานะจริง
      queue.push(
        { type: 'error', msg: `ไฟดับ ${outages.length} จุด: ${formatNames(outages)}`, cond: outages.length > 0 },
        { type: 'warning', msg: `ไฟตก/ไฟต่ำ ${powerFails.length} จุด: ${formatNames(powerFails)}`, cond: powerFails.length > 0 },
        { type: 'success', msg: `ไฟกลับมาแล้ว ${recovered.length} จุด: ${formatNames(recovered)}`, cond: recovered.length > 0 },
      );
    }

    if (canToast) {
      const item = queue.find(q => q.cond);
      if (item) {
        setToastType(item.type);
        setToastMessage(item.msg);
        setShowToast(true);
        lastToastAtRef.current = now;
      }
    }

    // อัปเดตสถานะรอบก่อน
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
              <span>PowerFail: {powerFailCount}</span>
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
            onRemove={(id) => {
              if (id === 'dashboardToast') setShowToast(false);
            }}
          />
        </div>
      )}
    </div>
  );
}