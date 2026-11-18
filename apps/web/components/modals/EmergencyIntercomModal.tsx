'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Wrench, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmergencyIntercomModalProps {
  isOpen: boolean;
  onClose: () => void;
  elevatorName?: string;
  floor?: number;
  onSendTechnician?: () => void;
}

export const EmergencyIntercomModal: React.FC<EmergencyIntercomModalProps> = ({
  isOpen,
  onClose,
  elevatorName = 'Elevator ELV-A-01 (Car 1)',
  floor = 4,
  onSendTechnician,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [technicianDispatched, setTechnicianDispatched] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setSeconds(0);
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleDispatchTech = () => {
    setTechnicianDispatched(true);
    if (onSendTechnician) onSendTechnician();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-md w-full p-4 sm:p-6 text-[#1E2232] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15804D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#15804D]"></span>
            </span>
            <h3 className="font-medium text-base text-[#433690]">Emergency Cabin Intercom (EN 81-28)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5D6375] hover:text-[#1E2232] p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Call Status & Details */}
        <div className="my-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#DCEFE4] border-2 border-[#15804D] flex items-center justify-center mb-3 animate-pulse">
            <PhoneCall className="h-8 w-8 text-[#15804D]" />
          </div>
          <h4 className="font-bold text-lg text-[#1E2232]">{elevatorName}</h4>
          <p className="text-xs text-[#5D6375] font-mono mt-0.5">Stationed near Floor {floor}</p>
          <div className="text-2xl font-mono font-bold text-[#15804D] mt-2">
            {formatTimer(seconds)}
          </div>
          <p className="text-[11px] text-[#5D6375] mt-1">Direct two-way acoustic duplex channel active</p>
        </div>

        {/* Intercom Audio Controls */}
        <div className="flex justify-center space-x-4 my-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full border transition-colors ${
              isMuted
                ? 'bg-[#F8DDDC] border-[#C92D29] text-[#C92D29]'
                : 'bg-[#EEF0F6] border-[#DCDFEA] text-[#1E2232] hover:bg-slate-200'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <div className="p-3 rounded-full bg-[#EEF0F6] border border-[#DCDFEA] text-[#15804D] flex items-center justify-center">
            <Volume2 className="h-5 w-5" />
          </div>
        </div>

        {/* Technician Dispatch Notification (if triggered) */}
        {technicianDispatched && (
          <div className="mb-4 p-2.5 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30 text-xs text-[#15804D] flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Technician Vikram Singh dispatched to Floor {floor} hoistway.</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#DCDFEA] grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDispatchTech}
            disabled={technicianDispatched}
            icon={<Wrench className="h-4 w-4" />}
          >
            {technicianDispatched ? 'Tech dispatched' : 'Send technician'}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onClose}
            icon={<PhoneOff className="h-4 w-4" />}
          >
            End call
          </Button>
        </div>
      </div>
    </div>
  );
};
