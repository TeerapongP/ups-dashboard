'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Edit, Zap, Database, Network, MapPin } from 'lucide-react';
import type { Device } from '@/lib/device';
import { UPSModalProps } from '@/types/upsModalProps';

const UPSModal: React.FC<UPSModalProps> = ({
    isOpen,
    onClose,
    onSave,
    device,
    mode,
}) => {
    const [formData, setFormData] = useState<Device & { data: any }>({
        ups_id: undefined as any, // ปล่อยว่างได้ตอน insert; ตอน edit จะถูกเซ็ตจาก props
        ip: '',
        brand: '',
        model: '',
        location: '',
        profile_name: null,
        data: {
            battery_percent: '',
            battery_vdc: '',
            battery_runtime_min: '',
            temperature_C: '',
            input_L1_V: '',
            input_L2_V: '',
            input_L3_V: '',
            input_L1_A: '',
            input_L2_A: '',
            input_L3_A: '',
            input_freq_Hz: '',
            output_freq_Hz: '',
            output_L1_V: '',
            output_L2_V: '',
            output_L3_V: '',
            output_L1_A: '',
            output_L2_A: '',
            output_L3_A: '',
            load_W: '',
            load_percent_L1: '',
            load_percent_L2: '',
            load_percent_L3: '',
            ident_manufacturer: '',
            ident_model: '',
            ident_fw: '',
            rating_voltage_v: '',
            rating_frequency_hz: '',
            rating_battery_voltage_v: '',
        },
        status: 'offline' as const,
        temperature: null,
        last_seen: '',
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'snmp'>('basic');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // init / reset เมื่อเปิด modal
    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && device) {
            setFormData({ ...device });
        } else {
            setFormData({
                ups_id: undefined as any,
                ip: '',
                brand: '',
                model: '',
                location: '',
                profile_name: null,
                data: {
                    battery_percent: '',
                    battery_vdc: '',
                    battery_runtime_min: '',
                    temperature_C: '',
                    input_L1_V: '',
                    input_L2_V: '',
                    input_L3_V: '',
                    input_L1_A: '',
                    input_L2_A: '',
                    input_L3_A: '',
                    input_freq_Hz: '',
                    output_freq_Hz: '',
                    output_L1_V: '',
                    output_L2_V: '',
                    output_L3_V: '',
                    output_L1_A: '',
                    output_L2_A: '',
                    output_L3_A: '',
                    load_W: '',
                    load_percent_L1: '',
                    load_percent_L2: '',
                    load_percent_L3: '',
                    ident_manufacturer: '',
                    ident_model: '',
                    ident_fw: '',
                    rating_voltage_v: '',
                    rating_frequency_hz: '',
                    rating_battery_voltage_v: '',
                },
                status: 'offline' as const,
                temperature: null,
                last_seen: '',
            });
        }
        setErrors({});
        setActiveTab('basic');
    }, [isOpen, mode, device]);

    // validate เบื้องต้น
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.ip?.trim()) newErrors.ip = 'IP Address is required';
        else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip)) newErrors.ip = 'Invalid IP Address format';

        if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
        if (!formData.model?.trim()) newErrors.model = 'Model is required';
        if (!formData.location?.trim()) newErrors.location = 'Location is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // handlers
    const handleInputChange = (field: keyof Device, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors((prev) => ({ ...prev, [field as string]: '' }));
        }
    };

    const handleSnmpDataChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value,
            },
        }));
    };

    // SNMP field config
    const snmpFields = [
        { key: 'battery_percent', label: 'Battery Percentage', icon: '🔋', category: 'Battery' },
        { key: 'battery_vdc', label: 'Battery Voltage (VDC)', icon: '⚡', category: 'Battery' },
        { key: 'battery_runtime_min', label: 'Battery Runtime (min)', icon: '⏱️', category: 'Battery' },
        { key: 'rating_battery_voltage_v', label: 'Rating Battery Voltage', icon: '🔋', category: 'Battery' },

        { key: 'temperature_C', label: 'Temperature (°C)', icon: '🌡️', category: 'Environmental' },

        { key: 'input_L1_V', label: 'Input L1 Voltage', icon: '📊', category: 'Input' },
        { key: 'input_L2_V', label: 'Input L2 Voltage', icon: '📊', category: 'Input' },
        { key: 'input_L3_V', label: 'Input L3 Voltage', icon: '📊', category: 'Input' },
        { key: 'input_L1_A', label: 'Input L1 Current', icon: '🔌', category: 'Input' },
        { key: 'input_L2_A', label: 'Input L2 Current', icon: '🔌', category: 'Input' },
        { key: 'input_L3_A', label: 'Input L3 Current', icon: '🔌', category: 'Input' },
        { key: 'input_freq_Hz', label: 'Input Frequency (Hz)', icon: '📶', category: 'Input' },

        { key: 'output_freq_Hz', label: 'Output Frequency (Hz)', icon: '📶', category: 'Output' },
        { key: 'output_L1_V', label: 'Output L1 Voltage', icon: '📤', category: 'Output' },
        { key: 'output_L2_V', label: 'Output L2 Voltage', icon: '📤', category: 'Output' },
        { key: 'output_L3_V', label: 'Output L3 Voltage', icon: '📤', category: 'Output' },
        { key: 'output_L1_A', label: 'Output L1 Current', icon: '📤', category: 'Output' },
        { key: 'output_L2_A', label: 'Output L2 Current', icon: '📤', category: 'Output' },
        { key: 'output_L3_A', label: 'Output L3 Current', icon: '📤', category: 'Output' },

        { key: 'load_W', label: 'Load (Watts)', icon: '💡', category: 'Load' },
        { key: 'load_percent_L1', label: 'Load Percentage L1', icon: '📈', category: 'Load' },
        { key: 'load_percent_L2', label: 'Load Percentage L2', icon: '📈', category: 'Load' },
        { key: 'load_percent_L3', label: 'Load Percentage L3', icon: '📈', category: 'Load' },

        { key: 'ident_manufacturer', label: 'Manufacturer ID', icon: '🏭', category: 'Identity' },
        { key: 'ident_model', label: 'Model ID', icon: '🏷️', category: 'Identity' },
        { key: 'ident_fw', label: 'Firmware ID', icon: '💾', category: 'Identity' },

        { key: 'rating_voltage_v', label: 'Rating Voltage', icon: '⚡', category: 'Rating' },
        { key: 'rating_frequency_hz', label: 'Rating Frequency', icon: '📶', category: 'Rating' },
    ];

    const groupedFields = snmpFields.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {} as Record<string, typeof snmpFields>);

    // กด Save (ส่งกลับให้หน้า Admin)
    const handleSaveClick = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await onSave(formData, mode);
            onClose();
        } catch (e: any) {
            setErrors({ general: e?.message ?? 'Save failed' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {mode === 'insert' ? <Plus className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                            <h2 className="text-2xl font-bold">
                                {mode === 'insert' ? 'เพิ่ม UPS Device' : 'แก้ไข UPS Device'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${activeTab === 'basic'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        <Network className="w-5 h-5" />
                        <span>Basic Information</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('snmp')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${activeTab === 'snmp'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        <Database className="w-5 h-5" />
                        <span>SNMP Configuration</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {errors.general && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {activeTab === 'basic' ? (
                        <div className="space-y-6">
                            {/* IP */}
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Network className="w-4 h-4" />
                                    <span>IP Address *</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.ip}
                                    onChange={(e) => handleInputChange('ip', e.target.value)}
                                    placeholder="10.50.11.11"
                                    disabled={mode === 'edit'}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${errors.ip ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                        } ${mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {errors.ip && <p className="text-red-500 text-sm mt-1">{errors.ip}</p>}
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Zap className="w-4 h-4" />
                                    <span>Brand *</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    placeholder="Smart Power"
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${errors.brand ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                        }`}
                                />
                                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                            </div>

                            {/* Model */}
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Database className="w-4 h-4" />
                                    <span>Model *</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => handleInputChange('model', e.target.value)}
                                    placeholder="HE-1K-IoT"
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${errors.model ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                        }`}
                                />
                                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>Location *</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    placeholder="DC-1 Rack A"
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${errors.location ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                        }`}
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>

                            {/* Profile Name (optional) */}
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Database className="w-4 h-4" />
                                    <span>Profile Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.profile_name || ''}
                                    onChange={(e) => handleInputChange('profile_name', e.target.value || null)}
                                    placeholder="Optional profile name"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedFields).map(([category, fields]) => (
                                <div key={category}>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {fields.map((field) => (
                                            <div key={String(field.key)}>
                                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                                    <span>{field.icon}</span>
                                                    <span>{field.label}</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.data[field.key] ?? ''}
                                                    onChange={(e) => handleSnmpDataChange(field.key, e.target.value)}
                                                    placeholder="SNMP OID"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-mono text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-6 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveClick}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{mode === 'insert' ? 'Create' : 'Update'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UPSModal;
