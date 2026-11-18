'use client';

import React from 'react';
import { X, AlertCircle, Wrench, ShieldCheck, ArrowDownRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeductionFactor {
  factor: string;
  points: number;
  tip: string;
  icon: 'door' | 'temp' | 'service' | 'general';
}

interface HealthScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  elevatorId: string;
  currentScore?: number;
}

export const HealthScoreBreakdownModal: React.FC<HealthScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  elevatorId,
  currentScore = 92,
}) => {
  if (!isOpen) return null;

  const deductions: DeductionFactor[] = [
    {
      factor: 'Door obstructions detected (2 events)',
      points: -4,
      tip: 'Clean optical curtain sensor guides and verify door safety edge alignment at floor 4 & 8.',
      icon: 'door',
    },
    {
      factor: 'Controller temperature transient spike (> 41 °C)',
      points: -2,
      tip: 'Check machine-room ventilation and ensure cooling fans are running without dust obstruction.',
      icon: 'temp',
    },
    {
      factor: 'Service interval threshold nearing (18 days remaining)',
      points: -2,
      tip: 'Schedule statutory quarterly preventive maintenance work order before month end.',
      icon: 'service',
    },
  ];

  const totalDeductions = deductions.reduce((acc, d) => acc + d.points, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-lg w-full p-4 sm:p-5 text-[#1E2232] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-[#433690]" />
            <h3 className="font-medium text-base text-[#433690]">
              Health score explanation
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

        {/* Current Score Summary */}
        <div className="my-4 p-4 rounded-[6px] bg-[#EEF0F6] border border-[#DCDFEA] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#5D6375] block">
              Current calculated score
            </span>
            <div className="text-2xl font-bold font-mono text-[#15804D] mt-0.5">
              {currentScore} <span className="text-xs text-[#5D6375] font-normal">/ 100 points</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#5D6375] block">Base score: 100</span>
            <span className="text-xs font-mono font-semibold text-[#C92D29]">
              Deductions: {totalDeductions} pts
            </span>
          </div>
        </div>

        {/* Deduction Factors List */}
        <div className="space-y-3 mb-5">
          <span className="text-xs font-semibold uppercase text-[#5D6375] tracking-wider block">
            Deduction factors & recommendations
          </span>

          {deductions.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-[6px] border border-[#DCDFEA] bg-white shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1E2232]">
                  {item.factor}
                </span>
                <span className="text-xs font-mono font-bold text-[#C92D29] bg-[#F8DDDC] px-2 py-0.5 rounded-[4px]">
                  {item.points} pts
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#5D6375] flex items-start space-x-1.5 bg-[#EEF0F6]/60 p-2 rounded-[4px]">
                <Lightbulb className="h-3.5 w-3.5 text-[#F5A524] mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Tip:</strong> {item.tip}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-[#DCDFEA]">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
