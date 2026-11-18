'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Mail, 
  Clock, 
  Plus, 
  Check, 
  FileSpreadsheet, 
  FileCheck,
  Building2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DateRangeSelector, DateRange } from '@/components/ui/DateRangeSelector';
import { ReportService } from '@/services/reportService';
import { ScheduledReport } from '@/mocks/reportMock';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'AVAILABILITY' | 'MAINTENANCE' | 'INCIDENTS' | 'ENERGY'>('AVAILABILITY');
  const [format, setFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: '30d',
    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newScheduleEmail, setNewScheduleEmail] = useState('');
  const [newScheduleFreq, setNewScheduleFreq] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('MONTHLY');

  useEffect(() => {
    async function load() {
      const data = await ReportService.getSchedules();
      setSchedules(data);
    }
    load();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await ReportService.generateReport({
      reportType,
      format,
      from: dateRange.from,
      to: dateRange.to,
    });
    setIsGenerating(false);
    setDownloadSuccess(result.filename);
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleEmail) return;
    const added = await ReportService.createSchedule({
      name: `${reportType.toLowerCase()} automated compliance digest`,
      format,
      frequency: newScheduleFreq,
      recipients: [newScheduleEmail],
      nextRunDate: '01 Dec 2026',
      status: 'ACTIVE',
    });
    setSchedules([...schedules, added]);
    setNewScheduleEmail('');
    setShowScheduleModal(false);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Intelligence & Compliance' }, { label: 'Statutory Reports' }]}
      title="Statutory Compliance & Fleet Report Generator"
      subtitle="Export certified PDF audits, Excel telemetry workbooks, and configure recurring automated email schedules"
    >
      {downloadSuccess && (
        <div className="mb-5 p-3.5 bg-[#DCEFE4] border border-[#15804D]/40 rounded-[6px] text-[#15804D] text-xs flex items-center space-x-2 shadow-xs">
          <Check className="h-4 w-4" />
          <span>Report generated successfully: <strong>{downloadSuccess}</strong> (Download initiated).</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: On-Demand Report Generator */}
        <div className="lg:col-span-7">
          <Card title="On-demand report generation">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#5D6375] font-medium mb-1.5">
                  Select report classification
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'AVAILABILITY', label: 'Fleet availability & SLA', desc: 'Uptime, MTTR, stoppage duration' },
                    { id: 'MAINTENANCE', label: 'Preventive maintenance & work orders', desc: 'Sign-offs, parts consumed' },
                    { id: 'INCIDENTS', label: 'Safety chain & fault incident logs', desc: 'IS 17900 / EN 81-20 compliance' },
                    { id: 'ENERGY', label: 'Energy consumption & regeneration', desc: 'kWh draw, ReGen efficiency' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setReportType(item.id as any)}
                      className={`cursor-pointer p-3 rounded-[6px] border transition-all ${
                        reportType === item.id
                          ? 'bg-[#E6E3F7] border-[#433690] text-[#433690]'
                          : 'bg-[#EEF0F6]/60 border-[#DCDFEA] text-[#1E2232] hover:border-[#433690]/40'
                      }`}
                    >
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-[#5D6375] mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range Selector */}
              <div>
                <label className="block text-[#5D6375] font-medium mb-1.5">
                  Reporting period range
                </label>
                <DateRangeSelector onChange={(range) => setDateRange(range)} />
              </div>

              {/* Export Format Selector */}
              <div>
                <label className="block text-[#5D6375] font-medium mb-1.5">
                  Export file format
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { format: 'PDF', label: 'PDF Document (.pdf)', icon: FileText },
                    { format: 'EXCEL', label: 'Excel Workbook (.xlsx)', icon: FileSpreadsheet },
                    { format: 'CSV', label: 'Raw CSV (.csv)', icon: FileCheck },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.format}
                        onClick={() => setFormat(fmt.format as any)}
                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-[6px] border text-xs font-medium transition-colors ${
                          format === fmt.format
                            ? 'bg-[#433690] text-white border-[#433690]'
                            : 'bg-white border-[#DCDFEA] text-[#5D6375]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCDFEA] flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  icon={<Download className="h-4 w-4" />}
                >
                  Generate and download report
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Recurring Email Schedulers */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Scheduled automated email reports"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleModal(true)}
                icon={<Plus className="h-3.5 w-3.5" />}
              >
                Add schedule
              </Button>
            }
          >
            <div className="space-y-3">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-[6px] bg-[#EEF0F6]/50 border border-[#DCDFEA] text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#1E2232]">
                      {sch.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#DCDFEA] font-bold">
                      {sch.format}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5D6375] flex items-center space-x-1.5 my-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Frequency: {sch.frequency} | Next run: {sch.nextRunDate}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#433690]">
                    Recipients: {sch.recipients.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Compliance certifications note">
            <p className="text-xs text-[#5D6375] leading-relaxed">
              Exported records contain digital checksum hashes compliant with statutory safety standards (IS 17900 / EN 81-20/50). Every entry is synchronized with the immutable PostgreSQL audit log.
            </p>
          </Card>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-md w-full p-4 sm:p-5 text-[#1E2232] animate-in fade-in zoom-in-95">
            <h3 className="font-medium text-base text-[#433690] pb-2 border-b border-[#DCDFEA]">
              Add recurring automated email report
            </h3>
            <form onSubmit={handleAddSchedule} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#5D6375] font-medium mb-1">
                  Recipient email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. director@facilityops.com"
                  value={newScheduleEmail}
                  onChange={(e) => setNewScheduleEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#DCDFEA] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[#5D6375] font-medium mb-1">
                  Frequency
                </label>
                <select
                  value={newScheduleFreq}
                  onChange={(e) => setNewScheduleFreq(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#DCDFEA] rounded-[6px]"
                >
                  <option value="WEEKLY">Weekly (Every Monday 08:00)</option>
                  <option value="MONTHLY">Monthly (1st of each month)</option>
                  <option value="QUARTERLY">Quarterly (Statutory closing)</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#DCDFEA]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
