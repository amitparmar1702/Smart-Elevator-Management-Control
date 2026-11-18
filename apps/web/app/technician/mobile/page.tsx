'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Camera, 
  Upload, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  AlertTriangle,
  ArrowLeft,
  Check,
  RotateCcw,
  FileCheck2,
  QrCode,
  Printer,
  X,
  WifiOff
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { audioService } from '@/lib/audioService';

export default function TechnicianMobilePage() {
  const [jobStatus, setJobStatus] = useState<'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Lock out / tag out machine room main isolator', done: true },
    { id: 'c2', label: 'Clean optical curtain sensor lenses on Floor 4', done: true },
    { id: 'c3', label: 'Verify brake disc lining clearance (target 0.35 mm)', done: false },
    { id: 'c4', label: 'Run 3 autonomous test trips with pit switch verified', done: false },
  ]);
  const [notes, setNotes] = useState('Optical sensor tracks cleaned. Feeler gauge test underway.');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [showReturnSuccess, setShowReturnSuccess] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isOfflineCached, setIsOfflineCached] = useState(true);

  const toggleCheck = (id: string) => {
    audioService.playCallRegistered();
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const allChecked = checklist.every((c) => c.done);

  const handleComplete = () => {
    audioService.playArrivalChime();
    setJobStatus('COMPLETED');
    setShowReturnSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F6] text-[#1E2232] p-4 max-w-[430px] mx-auto pb-16 font-sans">
      {/* Top Mobile App Bar */}
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] p-3.5 mb-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Link href="/maintenance/work-orders" className="p-1 rounded text-[#5D6375] hover:text-[#1E2232]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#433690] block tracking-wider">
              Field Technician Portal
            </span>
            <h1 className="text-sm font-bold text-[#1E2232]">
              WO-1092 Active Job
            </h1>
          </div>
        </div>
        <StatusBadge status={jobStatus === 'COMPLETED' ? 'Completed' : 'In progress'} size="sm" />
      </div>

      {/* Sub-Basement / Hoistway Offline-Ready Status */}
      <div className="mb-3 px-3 py-1.5 rounded-[6px] bg-white border border-[#DCDFEA] text-[11px] font-mono text-[#5D6375] flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-[#15804D] inline-block animate-pulse"></span>
          <span>IndexedDB Cache: Ready</span>
        </div>
        <span className="text-[10px] bg-[#EEF0F6] px-1.5 py-0.5 rounded text-[#433690] font-bold">
          Hoistway PWA Active
        </span>
      </div>

      {showReturnSuccess && (
        <div className="mb-4 p-3 bg-[#DCEFE4] border border-[#15804D]/40 rounded-[6px] text-xs text-[#15804D] space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span className="font-semibold">Work order completed! Elevator ELV-A-01 returned to normal fleet service.</span>
          </div>
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="w-full mt-2 py-1.5 px-3 bg-[#15804D] text-white rounded-[6px] font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-[#126B40] transition-colors shadow-xs"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Generate Statutory Certificate & QR Placard</span>
          </button>
        </div>
      )}

      {/* Asset Overview Card */}
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] p-4 mb-4 shadow-card">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-[#5D6375] uppercase">Target Asset</span>
            <h2 className="text-sm font-bold text-[#433690]">
              ELV-A-01 (Car 1 High-Speed)
            </h2>
            <p className="text-xs text-[#5D6375]">Apex Financial Tower A | Hoistway Bay 1</p>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F6E9D2] text-[#9C5C00]">
            P2 - High
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-[#DCDFEA] grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#EEF0F6] p-2 rounded-[6px]">
            <span className="text-[10px] text-[#5D6375] block">Fault Code</span>
            <span className="font-mono font-bold text-[#C92D29]">E-204 (Door obstruction)</span>
          </div>
          <div className="bg-[#EEF0F6] p-2 rounded-[6px]">
            <span className="text-[10px] text-[#5D6375] block">SLA Deadline</span>
            <span className="font-mono font-bold text-[#1E2232]">Today 14:00</span>
          </div>
        </div>
      </div>

      {/* Interactive Safety & Inspection Checklist (40px touch targets) */}
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] p-4 mb-4 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D6375] mb-3">
          Statutory inspection checklist
        </h3>
        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="flex items-center space-x-3 p-3 min-h-[44px] rounded-[6px] bg-[#EEF0F6]/70 border border-[#DCDFEA] cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div
                className={`w-6 h-6 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.done
                    ? 'bg-[#15804D] border-[#15804D] text-white'
                    : 'bg-white border-[#DCDFEA]'
                }`}
              >
                {item.done && <Check className="h-4 w-4 stroke-[3]" />}
              </div>
              <span
                className={`text-xs ${
                  item.done
                    ? 'line-through text-[#5D6375]'
                    : 'text-[#1E2232] font-medium'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Field Inspection Evidence / Photo Upload Simulation */}
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] p-4 mb-4 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D6375] mb-2">
          Inspection evidence & photo
        </h3>
        {hasPhoto ? (
          <div className="p-3 bg-[#EEF0F6] rounded-[6px] border border-[#DCDFEA] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Camera className="h-4 w-4 text-[#15804D]" />
              <span className="font-mono text-[11px]">evidence_door_curtain_f4.jpg (Uploaded)</span>
            </div>
            <button
              onClick={() => setHasPhoto(false)}
              className="text-[10px] text-[#C92D29] hover:underline"
            >
              Retake
            </button>
          </div>
        ) : (
          <button
            onClick={() => setHasPhoto(true)}
            className="w-full min-h-[44px] py-2.5 px-3 border-2 border-dashed border-[#DCDFEA] rounded-[6px] flex items-center justify-center space-x-2 text-xs text-[#433690] font-medium hover:bg-[#EEF0F6]/50 active:bg-[#EEF0F6]"
          >
            <Camera className="h-4 w-4" />
            <span>Capture / upload inspection photo</span>
          </button>
        )}

        <div className="mt-3">
          <label className="block text-[11px] text-[#5D6375] mb-1">
            Technician field notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232] resize-none"
          />
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-3 bg-white border-t border-[#DCDFEA] shadow-lg flex items-center space-x-2">
        <Link href="/control-room/grid" className="flex-1">
          <Button variant="outline" size="sm" className="w-full min-h-[42px]">
            Shaft grid
          </Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          className="flex-1 min-h-[42px]"
          disabled={!allChecked || jobStatus === 'COMPLETED'}
          onClick={handleComplete}
        >
          {jobStatus === 'COMPLETED' ? 'Job done' : 'Sign off & restore'}
        </Button>
      </div>

      {/* Statutory Certificate Modal */}
      <Modal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        title="Statutory Inspection Certificate"
        subtitle="EN 81-20/50 & IS 17900:2022 Safety Verification Sign-off"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#F8FAFC] border border-[#DCDFEA] rounded-[8px] space-y-2">
            <div className="flex items-center justify-between border-b border-[#DCDFEA] pb-2">
              <span className="font-bold text-[#433690]">CERT-IS17900-2026-ELV-A-01</span>
              <span className="text-[10px] bg-[#DCEFE4] text-[#15804D] px-2 py-0.5 rounded font-bold font-mono">
                STATUTORY PASSED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">ASSET ID</span>
                <span className="font-mono font-bold text-[#1E2232]">ELV-A-01 (Apex Tower A)</span>
              </div>
              <div>
                <span className="text-slate-400 block">INSPECTION DATE</span>
                <span className="font-mono font-semibold text-[#1E2232]">17-Nov-2026 15:45 IST</span>
              </div>
              <div>
                <span className="text-slate-400 block">LEAD INSPECTOR</span>
                <span className="font-semibold text-[#1E2232]">Arjun Rao (MH-LIFT-9482)</span>
              </div>
              <div>
                <span className="text-slate-400 block">SAFETY CHAIN TEST</span>
                <span className="font-semibold text-[#15804D]">Interlocks Normal (100%)</span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Placard & QR Code */}
          <div className="p-4 bg-white border border-[#DCDFEA] rounded-[8px] flex flex-col items-center text-center space-y-3">
            <div className="h-32 w-32 border-2 border-[#433690] p-2 rounded-[8px] bg-white flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <rect x="5" y="5" width="30" height="30" fill="#433690" />
                <rect x="10" y="10" width="20" height="20" fill="#FFFFFF" />
                <rect x="15" y="15" width="10" height="10" fill="#433690" />

                <rect x="65" y="5" width="30" height="30" fill="#433690" />
                <rect x="70" y="10" width="20" height="20" fill="#FFFFFF" />
                <rect x="75" y="15" width="10" height="10" fill="#433690" />

                <rect x="5" y="65" width="30" height="30" fill="#433690" />
                <rect x="10" y="70" width="20" height="20" fill="#FFFFFF" />
                <rect x="15" y="75" width="10" height="10" fill="#433690" />

                <rect x="45" y="10" width="8" height="8" fill="#433690" />
                <rect x="45" y="25" width="8" height="12" fill="#433690" />
                <rect x="15" y="45" width="15" height="8" fill="#433690" />
                <rect x="40" y="45" width="20" height="15" fill="#433690" />
                <rect x="68" y="45" width="22" height="8" fill="#433690" />
                <rect x="45" y="70" width="12" height="20" fill="#433690" />
                <rect x="70" y="70" width="18" height="18" fill="#433690" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">CRYPTOGRAPHIC VERIFICATION HASH</span>
              <span className="font-mono text-[9px] text-slate-600 break-all select-all">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Affix this QR code inside controller cabinet or car operating panel for statutory regulatory review.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print Placard
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCertificateOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
