'use client';

import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader';
import { DeviceDetailModal } from '@/components/DeviceDetailModal/DeviceDetailModal';
import { DeviceTable } from '@/components/DeviceTable/DeviceTable';
import { SearchAndControls } from '@/components/SearchAndControls/SearchAndControls';
import { Device } from '@/lib/device';
import React, { useState, useMemo } from 'react';
import { useUpsDevice } from '@/hooks/useUpsDevice';  
import Loading from '@/components/LoadingComponent/Loading';

const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('19/09/2025');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const requestUrl = useMemo(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_URL ?? '';
    const trimmed = rawBase.replace(/\/+$/, '');
    const apiBase = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    const endpoint = 'snmp/devices';
    if (!rawBase) return `/api/${endpoint}`;
    return `${apiBase}/${endpoint}`;
  }, []);

  const { deviceData, loading, error } = useUpsDevice(requestUrl);

  const devices: Device[] = useMemo(() => {
    return Array.isArray(deviceData) ? deviceData : [];
  }, [deviceData]);

  const filteredDevices = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return devices.filter((d) =>
      d.ip.toLowerCase().includes(q) ||
      d.brand.toLowerCase().includes(q) ||
      d.model.toLowerCase().includes(q) ||
      (d.location ?? '').toLowerCase().includes(q)
    );
  }, [devices, searchTerm]);

  const handleViewDevice = (device: Device) => setSelectedDevice(device);
  const handleEditDevice = (device: Device) => console.log('Edit device:', device);
  const handleDeleteDevice = (device: Device) => console.log('Delete device:', device);
  const handleAddDevice = () => console.log('Add new device');
  const handleGenerateReport = () => console.log('Generate PDF report');

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">Error: {String(error)}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* ✅ ส่ง devices ให้ DashboardHeader */}
        <DashboardHeader devices={devices} />

        <SearchAndControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAddDevice={handleAddDevice}
          onGenerateReport={handleGenerateReport}
        />

        <DeviceTable
          devices={filteredDevices}
          totalDevices={devices.length}
          onViewDevice={handleViewDevice}
          onEditDevice={handleEditDevice}
          onDeleteDevice={handleDeleteDevice}
          onAddDevice={handleAddDevice}
        />

        <DeviceDetailModal
          device={selectedDevice}
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
