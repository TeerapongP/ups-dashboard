'use client';

import React from 'react';
import { Search, Plus, FileDown } from 'lucide-react';
import { SearchAndControlsProps } from '@/types/searchAndControls';
import { BeautifulDatePicker } from '../BeautifulDatePicker/BeautifulDatePicker';

export const SearchAndControls: React.FC<SearchAndControlsProps> = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  onAddDevice,
  onGenerateReport,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาอุปกรณ์... (IP, Brand, Model, Location)"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="relative p-6">
          <BeautifulDatePicker
            selectedDate={selectedDate}
            onChange={onDateChange}
            placeholder="เลือกวันที่"
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onAddDevice}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Device
          </button>

          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FileDown className="w-5 h-5" />
            Export PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
