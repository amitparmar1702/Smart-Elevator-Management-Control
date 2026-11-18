'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  Layers, 
  Gauge, 
  Clock, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PredictionService } from '@/services/predictionService';
import { ComponentWearPrediction } from '@/mocks/predictionMock';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

export default function PredictiveMaintenancePage() {
  const [selectedElevator, setSelectedElevator] = useState('elv-a-01');
  const [wearPredictions, setWearPredictions] = useState<ComponentWearPrediction[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);

  const handleRecalculateRUL = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      setNoticeBanner('Neural degradation model updated. Remaining Useful Life (RUL) projections refreshed with latest 24hr vibration FFT metrics.');
      setTimeout(() => setNoticeBanner(null), 5000);
    }, 800);
  };

  const handleExportRUL = () => {
    const headers = ['Subsystem / Component', 'Health Score', 'Health Status', 'Estimated RUL', 'Recommended Action'];
    const rows = componentHealthData.map((d) => [
      `"${d.component}"`,
      `${d.health}%`,
      d.status,
      `"${d.rulDays} days"`,
      `"${d.health < 70 ? 'Schedule immediate replacement' : d.health < 85 ? 'Inspect during next PM' : 'Routine monitoring'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elevateos_rul_schedule_${selectedElevator}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNoticeBanner('Component Remaining Useful Life schedule exported as CSV.');
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  React.useEffect(() => {
    async function load() {
      const data = await PredictionService.getWearPredictions(selectedElevator);
      setWearPredictions(data);
    }
    load();
  }, [selectedElevator]);

  // Vibration FFT Harmonics data (Peak velocity mm/s vs Frequency Hz)
  const vibrationHarmonicsData = [
    { freq: '5 Hz', baseline: 0.12, actual: 0.15, threshold: 0.40 },
    { freq: '10 Hz', baseline: 0.18, actual: 0.22, threshold: 0.45 },
    { freq: '25 Hz (1X)', baseline: 0.35, actual: 0.68, threshold: 0.80 }, // Shaft unbalance
    { freq: '50 Hz (2X)', baseline: 0.20, actual: 0.42, threshold: 0.60 }, // Misalignment
    { freq: '100 Hz', baseline: 0.10, actual: 0.18, threshold: 0.35 },
    { freq: '250 Hz (BPFI)', baseline: 0.08, actual: 0.31, threshold: 0.50 }, // Inner race bearing wear
    { freq: '500 Hz (BPFO)', baseline: 0.05, actual: 0.12, threshold: 0.40 },
  ];

  // Component Health Index (0 - 100%)
  const componentHealthData = [
    { component: 'Traction Motor Bearings', health: 74, status: 'MODERATE_WEAR', rulDays: 84 },
    { component: 'Door Operator Belt & Rollers', health: 88, status: 'NORMAL', rulDays: 142 },
    { component: 'Guide Shoes / Roller Guides', health: 68, status: 'ATTENTION_NEEDED', rulDays: 45 },
    { component: 'Hoist Rope Tension Uniformity', health: 94, status: 'HEALTHY', rulDays: 320 },
    { component: 'Brake Lining Thickness', health: 82, status: 'NORMAL', rulDays: 190 },
    { component: 'Counterweight Buffer Fluid', health: 98, status: 'OPTIMAL', rulDays: 450 },
  ];

  // Radar chart of machine health dimensions
  const healthRadarData = [
    { dimension: 'Vibration Comfort', score: 82, baseline: 90 },
    { dimension: 'Thermal Stability', score: 88, baseline: 85 },
    { dimension: 'Door Dynamics', score: 91, baseline: 95 },
    { dimension: 'Brake Stopping Accuracy', score: 94, baseline: 90 },
    { dimension: 'Current Draw Efficiency', score: 79, baseline: 85 },
    { dimension: 'Ride Quality (ISO 18738)', score: 85, baseline: 92 },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Predictive Intelligence' }, { label: 'AI Health & RUL' }]}
      title="Predictive Maintenance & AI Telemetry Diagnostics"
      subtitle="Continuous FFT vibration spectrum analysis, Remaining Useful Life (RUL) modeling, and component fatigue tracking"
      actions={
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={selectedElevator}
            onChange={(e) => setSelectedElevator(e.target.value)}
            className="bg-page border border-card-border rounded-lg h-10 px-3 text-xs text-main font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="elv-a-01">Apex Tower - Car A1 (High-Speed Passenger)</option>
            <option value="elv-a-02">Apex Tower - Car A2 (Standard Passenger)</option>
            <option value="elv-a-03">Apex Tower - Car A3 (Heavy Freight & Service)</option>
            <option value="elv-a-04">Apex Tower - Car A4 (Firefighters / Emergency)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculateRUL}
            disabled={isRecalculating}
            className="flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 text-muted ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Computing FFT...' : 'Recalculate RUL'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {noticeBanner && (
          <div className="p-3 bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] rounded-[6px] text-xs font-medium flex items-center justify-between">
            <span>{noticeBanner}</span>
            <button onClick={() => setNoticeBanner(null)} className="hover:underline font-bold">Dismiss</button>
          </div>
        )}

        {/* Top 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Fleet AI Health Index</span>
              <span className="p-2 bg-[#EEF0F6] text-[#433690] rounded-lg">
                <Gauge className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1E2232] font-mono">84.2%</span>
              <span className="text-xs font-medium text-[#15804D] flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +1.4% vs last mo
              </span>
            </div>
            <p className="text-[11px] text-[#5D6375] mt-1">Good operational condition across 14 monitored nodes</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider">Earliest Predicted Service</span>
              <span className="p-2 bg-[#EEF0F6] text-[#9C5C00] rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1E2232] font-mono">45 Days</span>
              <span className="text-[10px] font-semibold text-[#9C5C00] bg-[#FFF4E5] px-1.5 py-0.5 rounded">Guide Shoes</span>
            </div>
            <p className="text-[11px] text-[#5D6375] mt-1">Scheduled PM work order #WO-882 recommends replacement</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider">Vibration RMS Peak</span>
              <span className="p-2 bg-[#EEF0F6] text-[#15804D] rounded-lg">
                <Activity className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1E2232] font-mono">0.048 <span className="text-sm font-normal text-[#5D6375]">g</span></span>
              <span className="text-xs font-medium text-[#15804D]">ISO 18738 Class A</span>
            </div>
            <p className="text-[11px] text-[#5D6375] mt-1">Well below safety trip threshold (0.120 g)</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider">Door Fatigue Milestone</span>
              <span className="p-2 bg-[#EEF0F6] text-[#433690] rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1E2232] font-mono">14,820</span>
              <span className="text-xs text-[#5D6375]">/ 100,000 cycles</span>
            </div>
            <div className="w-full bg-[#EEF0F6] h-1.5 rounded-full mt-2 overflow-hidden border border-[#DCDFEA]">
              <div className="bg-[#433690] h-full rounded-full" style={{ width: '14.8%' }}></div>
            </div>
          </Card>
        </div>

        {/* Middle Section: Vibration FFT Spectrum & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#433690] text-base">FFT Vibration Harmonics & Bearing Frequencies</h3>
                <p className="text-xs text-[#5D6375] mt-0.5">Real-time spectral analysis vs ISO velocity thresholds</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[#5D6375]">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-[#433690]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#433690]"></span> Actual Spectrum
                </span>
                <span className="flex items-center gap-1.5 text-[#C92D29]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C92D29]"></span> Alarm Threshold
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vibrationHarmonicsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="freq" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" mm/s" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCDFEA', color: '#1E2232', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                  />
                  <Bar dataKey="baseline" fill="#CBD5E1" name="Baseline (Factory)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#5543C0" name="Actual (Live)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threshold" fill="#C92D29" name="Trip Limit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-st-warning-bg rounded-lg border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-st-warning mt-0.5 flex-shrink-0" />
              <div className="text-xs text-st-warning leading-relaxed">
                <strong>Harmonic Advisory:</strong> Slight elevation detected at 25 Hz (1X running speed harmonic) indicating minor sheave imbalance. No immediate intervention required; recommended to check counterweight sheave alignment during next 60-day preventive maintenance cycle.
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-[#433690] text-base mb-1">Equipment Health Radar</h3>
            <p className="text-xs text-[#5D6375] mb-4">Multi-dimensional operational rating vs design baseline</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={healthRadarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="dimension" stroke="#64748B" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={9} />
                  <Radar name="Design Baseline" dataKey="baseline" stroke="#94A3B8" fill="#CBD5E1" fillOpacity={0.3} />
                  <Radar name="Current Performance" dataKey="score" stroke="#5543C0" fill="#5543C0" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCDFEA', color: '#1E2232', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Component Health & Remaining Useful Life Table */}
        <Card noPadding>
          <div className="p-4 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#433690] text-base">Critical Component Remaining Useful Life (RUL)</h3>
              <p className="text-xs text-[#5D6375] mt-0.5">Machine learning degradation models trained on operational telemetry</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportRUL} className="flex-shrink-0">
              Export RUL Schedule
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-page/60 text-muted font-mono text-[11px] uppercase tracking-wider border-b border-card-border">
                <tr>
                  <th className="px-5 py-3">Subsystem / Component</th>
                  <th className="px-5 py-3">Degradation Score</th>
                  <th className="px-5 py-3">Health Status</th>
                  <th className="px-5 py-3">Estimated RUL</th>
                  <th className="px-5 py-3">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {componentHealthData.map((item, i) => (
                  <tr key={i} className="hover:bg-page/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-main flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      {item.component}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-page h-2 rounded-full overflow-hidden border border-card-border">
                          <div 
                            className={`h-full rounded-full ${
                              item.health > 85 ? 'bg-st-running' : item.health > 70 ? 'bg-st-warning' : 'bg-st-alarm'
                            }`}
                            style={{ width: `${item.health}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-xs text-main font-mono">{item.health}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge 
                        status={
                          item.status === 'OPTIMAL' || item.status === 'HEALTHY'
                            ? 'NORMAL'
                            : item.status === 'NORMAL'
                            ? 'RUNNING'
                            : item.status === 'MODERATE_WEAR'
                            ? 'WARNING'
                            : 'FAULT'
                        } 
                      />
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-main font-mono">{item.rulDays} days</span>
                      <span className="text-[11px] text-muted block">approx. {(item.rulDays / 30).toFixed(1)} months</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium">
                      {item.health < 70 ? (
                        <span className="text-st-warning font-semibold bg-st-warning-bg px-2 py-0.5 rounded border border-amber-200">
                          Create Work Order
                        </span>
                      ) : (
                        <span className="text-muted">Monitor in regular PM</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

