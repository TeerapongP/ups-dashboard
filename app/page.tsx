'use client';

import BatteryDonutChart from '@/components/BatteryDonutChartComponent/BatteryDonutChart';
import DataTable from '@/components/DataTableComponent/DataTable';
import LoadBarChart from '@/components/LoadBarChartComponent/LoadBarChart';
import VoltageLineChart from '@/components/VoltageLineChartComponent/VoltageLineChart';
import Toast from '@/components/ToastComponent/Toast';
import NavBar from '@/components/NavBarComponent/NavBar';
import Loading from '@/components/LoadingComponent/Loading';
import { UPSData } from '@/types/ups';
import { useState, useEffect, useMemo } from 'react';
import GroupedSummaryCards from '@/components/GroupedSummaryCardsGroupComponent/GroupedSummaryCardsGroup';
import SearchFilter from '@/components/SearchFilterComponent/SearchFilter';
import { useAuth } from '../context/AuthContext';
import { useUpsPolling } from '@/hooks/useUpsPolling';

export default function UPSDashboard() {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [filteredData, setFilteredData] = useState<UPSData[]>([]);
  const [groupBy, setGroupBy] = useState<string>('none');

  const { loggedIn } = useAuth();
  
  // ประกอบ request URL จาก env (หรือจะ hardcode "/api/ups?..." ก็ได้)
  const requestUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL_DEV ?? '';
    const qs = 'timeout=1&retries=0&workers=12&ttl=2';
    // ถ้า base มีค่า → ใช้ `${base}/ups?...` , ถ้าไม่มีใช้ '/api/ups?...'
    return `${base ? `${base}/ups` : '/api/ups'}?${qs}`;
  }, []);

  const { upsData, loading, error } = useUpsPolling(loggedIn, requestUrl, 30000);

  // อัปเดต filter ครั้งแรก/เมื่อ upsData เปลี่ยน
  useEffect(() => {
    if (upsData?.length) {
      setFilteredData(upsData);
      setGroupBy('none');
    } else {
      setFilteredData([]);
    }
  }, [upsData]);

  // แสดง Toast เมื่อ error
  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  const handleFilter = (filtered: UPSData[], groupByValue: string) => {
    setFilteredData(filtered);
    setGroupBy(groupByValue);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <SearchFilter upsData={upsData} onFilter={handleFilter} />
      <GroupedSummaryCards upsData={filteredData} groupBy={groupBy} />
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {loggedIn ? (
            <>
              <BatteryDonutChart upsData={upsData} />
              <VoltageLineChart upsData={upsData} />
            </>
          ) : (
            <div></div>
          )}
        </div>
        {loggedIn ? (
          <div className="mb-6">
            <LoadBarChart upsData={upsData} />
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <DataTable upsData={upsData} />
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-full px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div>
              © 2025 UPS Monitoring Dashboard. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Total UPS Units: {upsData.length}</span>
              <span>•</span>
              <span>
                Online: {upsData.filter(ups => ups.status === 'Online').length}
              </span>
              <span>•</span>
              <span>
                Offline: {upsData.filter(ups => ups.status === 'Offline').length}
              </span>
            </div>
          </div>
        </div>
      </footer>
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Toast
            toast={{
              id: 'errorMessage',
              message: toastMessage,
              type: toastType,
              duration: 4000,
            }}
            onRemove={(id) => {
              if (id === 'errorMessage') {
                setShowToast(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}