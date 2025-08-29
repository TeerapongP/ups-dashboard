'use client';

import BatteryDonutChart from '@/components/BatteryDonutChartComponent/BatteryDonutChart';
import DataTable from '@/components/DataTableComponent/DataTable';
import LoadBarChart from '@/components/LoadBarChartComponent/LoadBarChart';
import VoltageLineChart from '@/components/VoltageLineChartComponent/VoltageLineChart';
import Toast from '@/components/ToastComponent/Toast';
import NavBar from '@/components/NavBarComponent/NavBar';
import Loading from '@/components/LoadingComponent/Loading';
import { UPSData } from '@/types/ups';
import { useState, useEffect } from 'react';
import GroupedSummaryCards from '@/components/GroupedSummaryCardsGroupComponent/GroupedSummaryCardsGroup';
import SearchFilter from '@/components/SearchFilterComponent/SearchFilter';

export default function UPSDashboard() {
  const [upsData, setUpsData] = useState<UPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [filteredData, setFilteredData] = useState<UPSData[]>([]);
  const [groupBy, setGroupBy] = useState<string>('none');

  useEffect(() => {
    const controller = new AbortController();
  
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_DEV}/ups?timeout=1&retries=0&workers=12&ttl=2`,
          {
            method: "GET",
            credentials: "include",   
            signal: controller.signal,   
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        setUpsData(data.items || []);
      } catch {
        setToastMessage("เกิดข้อผิดพลาดในการดึงข้อมูล");
        setToastType("error");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    const interval = setInterval(fetchData, 30000);
  
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, []);
  

  const handleFilter = (filtered: UPSData[], groupByValue: string) => {
    setFilteredData(filtered);
    setGroupBy(groupByValue);
  };


  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <SearchFilter upsData={upsData} onFilter={handleFilter} />

      <GroupedSummaryCards upsData={filteredData} groupBy={groupBy} />

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BatteryDonutChart upsData={upsData} />
          <VoltageLineChart upsData={upsData} />
        </div>

        <div className="mb-6">
          <LoadBarChart upsData={upsData} />
        </div>
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