'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FileDown, 
  Calendar, 
  Download, 
  Layers, 
  Cpu, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { KPIStatCard } from '../../../components/ui/KPIStatCard';
import { DateRangeSelector, DateRange } from '../../../components/ui/DateRangeSelector';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function FleetAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: '7d',
    from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportBanner, setExportBanner] = useState<string | null>(null);

  const availabilityData = [
    { day: 'Mon', availability: 99.85, trips: 1420, energyKwh: 340 },
    { day: 'Tue', availability: 99.92, trips: 1680, energyKwh: 380 },
    { day: 'Wed', availability: 99.70, trips: 1540, energyKwh: 360 },
    { day: 'Thu', availability: 99.95, trips: 1720, energyKwh: 395 },
    { day: 'Fri', availability: 99.65, trips: 1890, energyKwh: 420 },
    { day: 'Sat', availability: 100.0, trips: 980, energyKwh: 210 },
    { day: 'Sun', availability: 100.0, trips: 850, energyKwh: 190 },
  ];

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportBanner(`${format} Report for Apex Portfolio generated and downloaded.`);
      setTimeout(() => setExportBanner(null), 5000);
    }, 800);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Intelligence & Compliance' }, { label: 'Fleet Analytics' }]}
      title="Fleet Analytics & Reliability Intelligence"
      subtitle="Operational availability trends, energy consumption profiles, and statutory compliance metrics"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector
            onChange={(range) => setDateRange(range)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('PDF')}
            isLoading={isExporting}
            icon={<FileDown className="h-4 w-4" />}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExport('Excel')}
            icon={<Download className="h-4 w-4" />}
          >
            Export Excel
          </Button>
        </div>
      }
    >
      {exportBanner && (
        <div className="mb-4 p-3 bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] rounded-[6px] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{exportBanner}</span>
          </div>
          <button onClick={() => setExportBanner(null)} className="hover:underline font-bold">Dismiss</button>
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPIStatCard
          title="Availability (SLA)"
          value="99.85"
          unit="%"
          period="selected period"
          delta={0.15}
          deltaPeriod="vs target (99.7%)"
          upIsGood={true}
        />
        <KPIStatCard
          title="Total Passenger Trips"
          value="10,080"
          unit="trips"
          period="selected period"
          delta={4.2}
          deltaPeriod="vs prior period"
          upIsGood={true}
        />
        <KPIStatCard
          title="Energy Consumption"
          value="2,495"
          unit="kWh"
          period="selected period"
          delta={-2.8}
          deltaPeriod="efficiency gain"
          upIsGood={true}
        />
        <KPIStatCard
          title="Mean Time to Recovery"
          value="45"
          unit="min"
          period="selected period"
          delta={-15}
          deltaPeriod="faster vs last month"
          upIsGood={true}
        />
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Line Chart */}
        <Card title="Elevator fleet availability trend (%)">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={availabilityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCDFEA" />
                <XAxis dataKey="day" stroke="#5D6375" fontSize={11} />
                <YAxis domain={[99.0, 100]} stroke="#5D6375" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', color: '#1E2232', borderRadius: '8px', fontSize: '11px', borderColor: '#DCDFEA', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Line
                  type="monotone"
                  dataKey="availability"
                  stroke="#433690"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#433690' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Trips Volume Bar Chart */}
        <Card title="Daily trip volumes by bank">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={availabilityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCDFEA" />
                <XAxis dataKey="day" stroke="#5D6375" fontSize={11} />
                <YAxis stroke="#5D6375" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', color: '#1E2232', borderRadius: '8px', fontSize: '11px', borderColor: '#DCDFEA', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="trips" fill="#5543C0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

