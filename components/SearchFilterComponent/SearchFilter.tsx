'use client';

import { useState } from 'react';
import { SearchFilterProps } from '@/types/searchFilterPropsType';


export default function SearchFilter({ upsData, onFilter }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('none');

  const handleSearch = (searchValue: string, status: string, group: string) => {
    let filtered = upsData;

    if (searchValue.trim()) {
      filtered = filtered.filter(ups =>
        ups.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        ups.brand.toLowerCase().includes(searchValue.toLowerCase()) ||
        ups.model.toLowerCase().includes(searchValue.toLowerCase()) ||
        ups.location.toLowerCase().includes(searchValue.toLowerCase()) ||
        ups.ip.includes(searchValue)
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(ups => ups.status.toLowerCase() === status);
    }

    onFilter(filtered, group);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value, statusFilter, groupBy);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    handleSearch(searchTerm, value, groupBy);
  };

  const handleGroupChange = (value: string) => {
    setGroupBy(value);
    handleSearch(searchTerm, statusFilter, value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGroupBy('none');
    onFilter(upsData, 'none');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Search & Filter</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search UPS
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, Brand, Model, Location, IP..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
            <option value="powerfail">ไฟตกเท่านั้น</option>

          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group By
          </label>
          <select
            value={groupBy}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="none">No Grouping</option>
            <option value="status">Status</option>
            <option value="brand">Brand</option>
            <option value="location">Location</option>
            <option value="batteryLevel">Battery Level</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

    </div>
  );
}