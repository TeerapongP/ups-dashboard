'use client';

import React, { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader';
import { DeviceDetailModal } from '@/components/DeviceDetailModal/DeviceDetailModal';
import { DeviceTable } from '@/components/DeviceTable/DeviceTable';
import { SearchAndControls } from '@/components/SearchAndControls/SearchAndControls';
import { Device } from '@/lib/device';
import { useUpsDevice } from '@/hooks/useUpsDevice';
import Loading from '@/components/LoadingComponent/Loading';
import Toast from '@/components/ToastComponent/Toast';
import { DailyReportPayload } from '@/types/report';
import { generatePdfFrom } from '@/components/report/GeneratePdfFrom/GeneratePdfFromComponent';
import UPSModal from '@/components/UPSModal/UPSModal';

const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDelete, setIsDelete] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'insert' | 'edit'>('insert');
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const rawBase = process.env.NEXT_PUBLIC_API_URL ?? '';
  const trimmed = rawBase.replace(/\/+$/, '');
  const apiBase = trimmed
    ? (trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`)
    : 'http://localhost:8000/api';

  const requestUrl = useMemo(() => {
    const endpoint = 'snmp/devices';
    return `${apiBase}/${endpoint}`;
  }, [apiBase]);

  const { deviceData, loading, error, refetch } = useUpsDevice(requestUrl);

  const devices: Device[] = useMemo(
    () => (Array.isArray(deviceData) ? deviceData : []),
    [deviceData]
  );

  const filteredDevices = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return devices.filter(
      (d) =>
        d.ip.toLowerCase().includes(q) ||
        d.brand.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        (d.location ?? '').toLowerCase().includes(q)
    );
  }, [devices, searchTerm]);

  const handleAddDevice = () => {
    setModalMode('insert');
    setEditingDevice(null);
    setIsModalOpen(true);
  };
  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsDelete(false);
  }
  const handleEditDevice = async (device: Device) => {
    try {
      setModalMode('edit');

      // Fetch device configuration from API
      const configUrl = `${apiBase}/snmp/devices/${encodeURIComponent(device.ip)}/config?base_profile=STANDARD`;
      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        const configData = await response.json();
        // Map the oids from API response to data property for UPSModal
        const deviceWithConfig = {
          ...device,
          data: configData.oids || configData || device.data || {}
        };
        setEditingDevice(deviceWithConfig);
      } else {
        setToastMessage("Failed to fetch device config, using original data");
        setToastType("warning")
        setShowToast(true)
        setEditingDevice(device);
      }

      setIsModalOpen(true);
    } catch (error: unknown) {
      setToastMessage('Error fetching device config: ' + String(error));
      setToastType("error")
      setShowToast(true)
      setEditingDevice(device);
      setIsModalOpen(true);
    }
  };

  const handleSaveDevice = async (device: Device, mode: 'insert' | 'edit') => {
    try {
      let res: Response;
      if (mode === 'edit') {
        // แก้ไขอุปกรณ์ - use correct SNMP endpoint
        res = await fetch(`${apiBase}/snmp/devices/${device.ups_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(device),
        });
      } else {
        res = await fetch(`${apiBase}/snmp/devices/with-oids`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(device),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Request failed: ${res.status}`);
      }

      // ถ้า success
      await refetch(); // โหลดข้อมูลใหม่
      setToastMessage(`${mode === 'edit' ? "อัพเดท" : "เพิ่ม"} ${device.ups_id} สำเร็จ`);
      setToastType("success");
      setShowToast(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setToastMessage(`บันทึกไม่สำเร็จ: ${errorMessage}`);
      setToastType("error");
      setShowToast(true);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerateReport = async () => {
    if (isGenerating) return;           // กันซ้ำชั้นแรก
    try {
      if (!selectedDate) {
        setToastMessage("กรุณาเลือกวันที่ก่อน");
        setToastType("warning");
        setShowToast(true);
        return;
      }

      setIsGenerating(true);

      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const params = new URLSearchParams();
      params.set("only_with_events", "true");
      const url = `${apiBase}/daily/${dateStr}/json?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: DailyReportPayload = await res.json();

      await generatePdfFrom({
        data,
        fileName: `DailyReport_${dateStr}.pdf`,
      });

      setToastMessage(`สร้างรายงานวันที่ ${dateStr} สำเร็จ`);
      setToastType("success");
      setShowToast(true);
    } catch (error: unknown) {
      console.error("Generate report error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`สร้างรายงานไม่สำเร็จ: ${errorMessage}`);
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsGenerating(false);
    }
  };


  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">Error: {String(error)}</div>;

  const handleDeleteDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsDelete(true);
  };

  const deleteDevice = async (upsId: string) => {
    const res = await fetch(`${requestUrl}/${encodeURIComponent(upsId)}`, {
      method: 'DELETE',
      headers: { accept: 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const confirmDelete = async () => {
    if (!selectedDevice) return;
    try {
      await deleteDevice(selectedDevice.ups_id);
      await refetch();
      setToastMessage(`ลบ ${selectedDevice.ups_id} สำเร็จ`);
      setToastType('success');
      setShowToast(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setToastMessage(`ลบ ${selectedDevice.ups_id} ไม่สำเร็จ: ${errorMessage}`);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsDelete(false);
      setSelectedDevice(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
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
          isDelete={isDelete}
          onConfirmDelete={confirmDelete}
        />

        <UPSModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDevice}
          device={editingDevice ?? undefined}
          mode={modalMode}
        />
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Toast
            toast={{
              id: 'adminToast',
              message: toastMessage,
              type: toastType,
              duration: 4000,
            }}
            onRemove={(id: string) => {
              if (id === 'adminToast') setShowToast(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;