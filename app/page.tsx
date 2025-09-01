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


function isPowerOutage(u: UPSData): boolean {
  return (u.status ?? '').trim().toLowerCase() === 'offline';
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

  const prevOutageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!upsData?.length) return;

    const outagesNow = new Set(
      upsData.filter(isPowerOutage).map(u => u.id)
    );
    const outagesPrev = prevOutageIdsRef.current;

    const newlyOut = [...outagesNow].filter(id => !outagesPrev.has(id));
    if (newlyOut.length) {
      setToastType("warning");
      setToastMessage(
        `ไฟดับ ${newlyOut.length} จุด: ${newlyOut
          .slice(0, 3)
          .join(", ")}${newlyOut.length > 3 ? "…" : ""}`
      );
      setShowToast(true);
    }

    // UPS ที่ไฟกลับมาแล้ว
    const recovered = [...outagesPrev].filter(id => !outagesNow.has(id));
    if (recovered.length) {
      setToastType("success");
      setToastMessage(
        `ไฟกลับมาแล้ว ${recovered.length} จุด: ${recovered
          .slice(0, 3)
          .join(", ")}${recovered.length > 3 ? "…" : ""}`
      );
      setShowToast(true);
    }

    const stillOffline = [...outagesNow];
    if (stillOffline.length) {
      setToastType("warning");
      setToastMessage(
        `ยัง Offline อยู่ ${stillOffline.length} จุด: ${stillOffline
          .slice(0, 3)
          .join(", ")}${stillOffline.length > 3 ? "…" : ""}`
      );
      setShowToast(true);
    }

    prevOutageIdsRef.current = outagesNow;
  }, [upsData]);

  const handleFilter = useCallback((filtered: UPSData[], groupByValue: string) => {
    setFilteredData(filtered);
    setGroupBy(groupByValue);
  }, []);

  const deferredFiltered = useDeferredValue(filteredData);

  if (loading) return <Loading />;

  const totalCount = upsData.length;
  const onlineCount = upsData.filter(u => (u.status ?? '').toLowerCase() === 'online').length;
  const offlineCount = upsData.filter(u => (u.status ?? '').toLowerCase() === 'offline').length;

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
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Total UPS Units: {totalCount}</span>
              <span>•</span>
              <span>Online: {onlineCount}</span>
              <span>•</span>
              <span>Offline: {offlineCount}</span>
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
