'use client';

import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface AlarmItem {
  id: string;
  elevator: string;
  building: string;
  code: string;
  type: string;
  description: string;
  severity: string;
}

interface CreateWorkOrderFromAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarm: AlarmItem | null;
  onSuccess: (workOrderId: string) => void;
}

export const CreateWorkOrderFromAlarmModal: React.FC<CreateWorkOrderFromAlarmModalProps> = ({
  isOpen,
  onClose,
  alarm,
  onSuccess,
}) => {
  const [priority, setPriority] = useState('HIGH');
  const [technician, setTechnician] = useState('Vikram Singh (Certified Traction Specialist)');
  const [assignedNotes, setAssignedNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !alarm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedWoId = `WO-${Math.floor(1000 + Math.random() * 9000)}`;
      onSuccess(generatedWoId);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-lg w-full p-4 sm:p-5 text-[#1E2232] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-[#433690]" />
            <h3 className="font-medium text-base text-[#433690]">
              Create work order from alarm
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5D6375] hover:text-[#1E2232] p-1 rounded-md"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Pre-filled read-only details */}
          <div className="p-3 bg-[#EEF0F6] rounded-[6px] border border-[#DCDFEA] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5D6375]">Origin alarm ID:</span>
              <span className="font-mono font-bold text-[#433690]">{alarm.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5D6375]">Elevator asset:</span>
              <span className="font-medium text-[#1E2232]">{alarm.elevator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5D6375]">Facility / building:</span>
              <span className="text-[#1E2232]">{alarm.building}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5D6375]">Fault code:</span>
              <span className="font-mono font-bold text-[#C92D29]">{alarm.code}</span>
            </div>
            <div className="pt-1 border-t border-[#DCDFEA]">
              <span className="text-[#5D6375] block mb-0.5">Reported condition:</span>
              <span className="text-[#1E2232] italic">{alarm.description}</span>
            </div>
          </div>

          {/* Form Controls */}
          <div>
            <label className="block text-xs font-medium text-[#5D6375] mb-1">
              Priority level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="CRITICAL">Critical (P1 - Immediate dispatch)</option>
              <option value="HIGH">High (P2 - 2 hr SLA)</option>
              <option value="MEDIUM">Medium (P3 - Next business day)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D6375] mb-1">
              Assign to technician
            </label>
            <select
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="Vikram Singh (Certified Traction Specialist)">Vikram Singh (Certified Traction Specialist - On Duty)</option>
              <option value="Arjun Rao (Door Systems Lead)">Arjun Rao (Door Systems Lead - On Duty)</option>
              <option value="Kavita Nair (Safety Inspector)">Kavita Nair (Safety Inspector)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D6375] mb-1">
              Special instructions for technician
            </label>
            <textarea
              rows={2}
              value={assignedNotes}
              onChange={(e) => setAssignedNotes(e.target.value)}
              placeholder="e.g. Bring replacement optical curtain sensor kit and lock out car before entering hoistway."
              className="w-full p-2.5 text-xs bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232] resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-[#DCDFEA]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Create work order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
