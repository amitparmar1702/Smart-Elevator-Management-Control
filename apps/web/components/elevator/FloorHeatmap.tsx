'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface FloorTrafficStats {
  floor: number;
  floorLabel: string;
  callsCount: number;
  doorObstructionsCount: number;
}

interface FloorHeatmapProps {
  elevatorId: string;
  floorsCount?: number;
}

export const FloorHeatmap: React.FC<FloorHeatmapProps> = ({ elevatorId, floorsCount = 12 }) => {
  // Generate floor stats (from top floor to lowest)
  const floorData: FloorTrafficStats[] = Array.from({ length: floorsCount }, (_, i) => {
    const floor = floorsCount - i;
    // Ground floor (1) and high floors get higher call volume
    const callsCount = floor === 1 ? 480 : floor === 8 ? 320 : Math.floor(120 + ((floor * 17) % 180));
    const doorObstructionsCount = floor === 4 ? 6 : floor === 8 ? 4 : floor % 3 === 0 ? 1 : 0;
    return {
      floor,
      floorLabel: `Floor ${floor}`,
      callsCount,
      doorObstructionsCount,
    };
  });

  const maxCalls = Math.max(...floorData.map((d) => d.callsCount));
  const maxObstructions = Math.max(...floorData.map((d) => d.doorObstructionsCount), 1);

  // Intensity color generator for calls (Purple palette)
  const getCallIntensityClass = (calls: number) => {
    const ratio = calls / maxCalls;
    if (ratio > 0.75) return 'bg-[#433690] text-white';
    if (ratio > 0.5) return 'bg-[#5543C0] text-white';
    if (ratio > 0.25) return 'bg-[#E6E3F7] text-[#433690] font-semibold';
    return 'bg-[#EEF0F6] text-[#5D6375]';
  };

  // Intensity color generator for door obstructions (Amber/Red palette)
  const getObstructionIntensityClass = (count: number) => {
    if (count >= 5) return 'bg-[#C92D29] text-white font-bold';
    if (count >= 2) return 'bg-[#9C5C00] text-white font-semibold';
    if (count === 1) return 'bg-[#F6E9D2] text-[#9C5C00] font-medium';
    return 'bg-[#DCEFE4] text-[#15804D]';
  };

  return (
    <Card title="Floor traffic & obstruction heat map">
      <div className="text-xs text-[#5D6375] mb-4">
        Heat map of passenger landing calls and door obstruction density by floor level.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase">
              <th className="py-2 px-3 w-24">Floor level</th>
              <th className="py-2 px-3">Landing calls volume (7 days)</th>
              <th className="py-2 px-3 w-36 text-right">Door obstructions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDFEA]">
            {floorData.map((row) => (
              <tr key={row.floor} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-mono font-bold text-[#1E2232]">
                  {row.floorLabel}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-6 rounded-[4px] flex items-center justify-end px-2 text-[11px] font-mono transition-all duration-300 ${getCallIntensityClass(
                        row.callsCount
                      )}`}
                      style={{ width: `${Math.max(18, (row.callsCount / maxCalls) * 100)}%` }}
                    >
                      {row.callsCount} calls
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono ${getObstructionIntensityClass(
                      row.doorObstructionsCount
                    )}`}
                  >
                    {row.doorObstructionsCount} {row.doorObstructionsCount === 1 ? 'event' : 'events'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
