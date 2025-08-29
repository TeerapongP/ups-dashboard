'use client';

import { GroupedSummaryCardsProps } from '@/types/groupedSummaryCardsPropsType';
import { UPSData } from '@/types/ups';


export default function GroupedSummaryCards({ upsData, groupBy }: GroupedSummaryCardsProps) {
  const groupData = (data: UPSData[], groupKey: string) => {
    if (groupKey === 'none') {
      return { 'All UPS Units': data };
    }

    const groups: { [key: string]: UPSData[] } = {};

    data.forEach(ups => {
      let groupValue: string;

      switch (groupKey) {
        case 'status':
          groupValue = ups.status;
          break;
        case 'brand':
          groupValue = ups.brand;
          break;
        case 'location':
          groupValue = ups.location;
          break;
        case 'batteryLevel':
          const batteryLevel = ups.batteryPercent ?? 0;
          if (batteryLevel >= 80) groupValue = 'High (80-100%)';
          else if (batteryLevel >= 50) groupValue = 'Medium (50-79%)';
          else if (batteryLevel >= 20) groupValue = 'Low (20-49%)';
          else groupValue = 'Critical (<20%)';
          break;
        default:
          groupValue = 'Unknown';
      }

      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(ups);
    });

    return groups;
  };

  const getGroupIcon = (groupKey: string, groupName: string) => {
    switch (groupKey) {
      case 'status':
        return groupName === 'Online' ? '🟢' : '🔴';
      case 'brand':
        return '🏢';
      case 'location':
        return '📍';
      case 'batteryLevel':
        if (groupName.includes('High')) return '🔋';
        if (groupName.includes('Medium')) return '🔋';
        if (groupName.includes('Low')) return '🪫';
        if (groupName.includes('Critical')) return '⚠️';
        return '🔋';
      default:
        return '📊';
    }
  };

  const getGroupStats = (groupData: UPSData[]) => {
    const total = groupData.length;
    const online = groupData.filter(ups => ups.status === 'Online').length;
    const offline = total - online;
    const avgBattery = Math.round(
      groupData.reduce((sum, ups) => sum + (ups.batteryPercent ?? 0), 0) / total
    );
    const avgTemp = Math.round(
      groupData.reduce((sum, ups) => sum + (ups.temperatureC ?? 0), 0) / total
    );
    const totalLoad = groupData.reduce((sum, ups) => sum + ups.loadVA, 0);

    return { total, online, offline, avgBattery, avgTemp, totalLoad };
  };

  const grouped = groupData(upsData, groupBy);
  const groupNames = Object.keys(grouped).sort();

  if (groupBy === 'none') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {upsData.map((ups) => (
          <div
            key={ups.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">{ups.id}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  ups.status === 'Online'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {ups.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-semibold text-gray-800">{ups.ip}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-semibold text-gray-800">{ups.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-semibold text-gray-800 text-xs">{ups.model}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-800">{ups.location}</p>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Battery</p>
                  <p className="text-3xl font-bold text-blue-600">{ups.batteryPercent ?? 0}%</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-lg font-semibold text-orange-600">{ups.temperatureC ?? 0}°C</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {groupNames.map((groupName) => {
        const groupUpsData = grouped[groupName];
        const stats = getGroupStats(groupUpsData);
        
        return (
          <div key={groupName} className="bg-gray-50 rounded-xl p-6">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getGroupIcon(groupBy, groupName)}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{groupName}</h2>
                  <p className="text-sm text-gray-600">{stats.total} UPS units</p>
                </div>
              </div>
              
              {/* Group Statistics */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{stats.online}</div>
                  <div className="text-gray-600">Online</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{stats.offline}</div>
                  <div className="text-gray-600">Offline</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{stats.avgBattery}%</div>
                  <div className="text-gray-600">Avg Battery</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{stats.avgTemp}°C</div>
                  <div className="text-gray-600">Avg Temp</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{stats.totalLoad.toLocaleString()}</div>
                  <div className="text-gray-600">Total Load (VA)</div>
                </div>
              </div>
            </div>

            {/* Group Statistics for Mobile */}
            <div className="md:hidden grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="font-semibold text-green-600">{stats.online}</div>
                <div className="text-sm text-gray-600">Online</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="font-semibold text-red-600">{stats.offline}</div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="font-semibold text-blue-600">{stats.avgBattery}%</div>
                <div className="text-sm text-gray-600">Avg Battery</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="font-semibold text-orange-600">{stats.avgTemp}°C</div>
                <div className="text-sm text-gray-600">Avg Temp</div>
              </div>
            </div>

            {/* UPS Cards in Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupUpsData.map((ups) => (
                <div
                  key={ups.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{ups.id}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ups.status === 'Online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ups.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">IP: {ups.ip}</p>
                      <p className="text-xs text-gray-600">{ups.brand} - {ups.model}</p>
                      <p className="text-xs text-gray-600">📍 {ups.location}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{ups.batteryPercent ?? 0}%</p>
                          <p className="text-xs text-gray-600">Battery</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">{ups.temperatureC ?? 0}°C</p>
                          <p className="text-xs text-gray-600">Temp</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}