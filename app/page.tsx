'use client';

import BatteryDonutChart from '@/components/BatteryDonutChartComponent/BatteryDonutChart';
import DataTable from '@/components/DataTableComponent/DataTable';
import LoadBarChart from '@/components/LoadBarChartComponent/LoadBarChart';
import SummaryCards from '@/components/SummaryCardsComponent/SummaryCards';
import VoltageLineChart from '@/components/VoltageLineChartComponent/VoltageLineChart';
import Toast from '@/components/ToastComponent/Toast';
import NavBar from '@/components/NavBarComponent/NavBar';
import Loading from '@/components/LoadingComponent/Loading';
import { UPSData } from '@/types/ups';
import { useState, useEffect } from 'react';

export default function UPSDashboard() {
  const [upsData, setUpsData] = useState<UPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/ups.json');
        const data = await response.json();
        setUpsData(data);
      } catch (error) {
        setToastMessage('เกิดข้อผิดพลาดในการดึงข้อมูล');
        setToastType('error');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);



  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <SummaryCards upsData={upsData} />

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