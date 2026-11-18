'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileCheck, 
  Clock, 
  Camera 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { audioService } from '@/lib/audioService';

export default function TechnicianDashboard() {
  const [selectedJob, setSelectedJob] = useState('WO-1092');
  const [checklist, setChecklist] = useState([
    { id: 1, item: 'Motor Bearing Temperature (< 70°C)', reading: '48.2°C', status: 'PASS' },
    { id: 2, item: 'Traction Sheave Groove Wear', reading: '0.4mm (Nominal)', status: 'PASS' },
    { id: 3, item: 'Door Interlock Roller Clearance (2-4mm)', reading: '3.1mm', status: 'PASS' },
    { id: 4, item: 'Guide Shoe Lubrication Reservoir', reading: 'Refilled 250ml', status: 'PASS' },
    { id: 5, item: 'Brake Plunger Stroke & Lining Gap', reading: '0.65mm', status: 'ATTENTION' },
  ]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const assignedJobs = [
    {
      id: 'WO-1092',
      elevator: 'ELV-A-01 (Car 1 High-Speed)',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      dueDate: 'Today, 14:00',
      status: 'IN_PROGRESS',
      building: 'Apex Financial Tower A',
    },
    {
      id: 'WO-1095',
      elevator: 'ELV-A-03 (Car 3 Freight)',
      type: 'BREAKDOWN',
      priority: 'HIGH',
      dueDate: 'Today, 17:00',
      status: 'SCHEDULED',
      building: 'Apex Financial Tower A',
    },
    {
      id: 'WO-1088',
      elevator: 'ELV-A-02 (Car 2 Standard)',
      type: 'INSPECTION',
      priority: 'LOW',
      dueDate: 'Completed Yesterday',
      status: 'COMPLETED',
      building: 'Apex Financial Tower A',
    },
  ];

  const handleSubmitJob = () => {
    audioService.playArrivalChime();
    setIsSubmitted(true);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Field Engineering' }, { label: 'Technician Work Orders' }]}
      title="Field Service & Inspection Board"
      subtitle="Digital maintenance work orders, checklist sign-offs and spare parts consumption"
      actions={
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#5D6375]">Assigned Technician:</span>
          <span className="font-bold text-[#1E2232] text-xs">Arjun Rao (Cert #TK-842)</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Jobs List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5D6375] mb-1">
            My Assigned Work Orders
          </h3>
          {assignedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job.id)}
              className={`p-4 rounded-[8px] border cursor-pointer transition-all ${
                selectedJob === job.id
                  ? 'bg-white border-[#433690] shadow-card ring-1 ring-[#433690]/30'
                  : 'bg-white border-[#DCDFEA] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-[#433690] text-xs">{job.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    job.priority === 'HIGH'
                      ? 'bg-[#F8DDDC] text-[#C92D29]'
                      : job.priority === 'MEDIUM'
                      ? 'bg-[#F6E9D2] text-[#9C5C00]'
                      : 'bg-slate-100 text-[#5D6375]'
                  }`}
                >
                  {job.priority} PRIORITY
                </span>
              </div>
              <h4 className="text-xs font-medium text-[#1E2232]">{job.elevator}</h4>
              <p className="text-[11px] text-[#5D6375] mt-0.5">{job.building}</p>

              <div className="mt-3 pt-2 border-t border-[#DCDFEA] flex items-center justify-between text-[11px] text-[#5D6375]">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{job.dueDate}</span>
                </span>
                <span className="font-semibold text-[#433690]">{job.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Active Inspection Checklist & Submission */}
        <div className="lg:col-span-8">
          <Card
            title={`Active Work Order: ${selectedJob}`}
            subtitle="Traction Machine, Brake & Hoistway Comprehensive PM (EN 81-20)"
            action={
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#F6E9D2] text-[#9C5C00] border border-[#9C5C00]/30">
                IN PROGRESS
              </span>
            }
          >
            {isSubmitted ? (
              <div className="p-8 text-center bg-[#DCEFE4] border border-[#15804D]/30 rounded-[8px]">
                <CheckCircle2 className="h-12 w-12 text-[#15804D] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#15804D]">Work Order Submitted for Verification</h3>
                <p className="text-xs text-[#15804D] mt-1">
                  Inspection checklist, digital signature and replacement logs have been forwarded to Supervisor Vikram Singh for sign-off.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Inspection Checklist Table */}
                <div>
                  <h4 className="text-xs font-semibold text-[#1E2232] mb-2.5 flex items-center space-x-1.5">
                    <FileCheck className="h-4 w-4 text-[#433690]" />
                    <span>Mandatory Verification Checklist</span>
                  </h4>

                  <div className="border border-[#DCDFEA] rounded-[6px] overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[460px]">
                      <thead className="bg-[#EEF0F6] border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Inspection Item</th>
                          <th className="py-2.5 px-3">Recorded Observation</th>
                          <th className="py-2.5 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCDFEA]">
                        {checklist.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-[#1E2232]">{item.item}</td>
                            <td className="py-2.5 px-3 font-mono text-[#5D6375]">{item.reading}</td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${
                                  item.status === 'PASS'
                                    ? 'bg-[#DCEFE4] text-[#15804D] border border-[#15804D]/30'
                                    : 'bg-[#F6E9D2] text-[#9C5C00] border border-[#9C5C00]/30'
                                }`}
                              >
                                {item.status === 'PASS' ? '● PASS' : '▲ ATTENTION'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Spare Parts Consumed */}
                <div className="p-3 bg-[#EEF0F6]/60 rounded-[6px] border border-[#DCDFEA] text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#1E2232]">Spare Parts Consumed:</span>
                    <span className="text-[11px] text-[#433690] cursor-pointer hover:underline font-medium">+ Log Replacement Part</span>
                  </div>
                  <p className="text-[#5D6375] text-[11px]">
                    1x Door Interlock Roller Assembly (SKU-DR-201) | Deducted from Apex On-Site Inventory.
                  </p>
                </div>

                {/* Technician Sign-Off & Submission */}
                <div className="pt-3 border-t border-[#DCDFEA] flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-[#5D6375]">
                    <Camera className="h-4 w-4" />
                    <span>2 Inspection photos attached</span>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitJob}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Complete & Sign Off Work Order
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
