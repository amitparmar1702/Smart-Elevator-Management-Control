'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { audioService } from '@/lib/audioService';

interface WeekStripDatePickerProps {
  initialDate?: string; // YYYY-MM-DD
  onDateChange?: (dateStr: string) => void;
  className?: string;
}

export function WeekStripDatePicker({
  initialDate = '2026-11-20',
  onDateChange,
  className = '',
}: WeekStripDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [viewDate, setViewDate] = useState<Date>(() => new Date(initialDate));

  // Determine current week days (7 days around the active date)
  const weekDays = useMemo(() => {
    const days = [];
    const current = new Date(viewDate);
    // Find the Monday of current week
    const dayOfWeek = current.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    current.setDate(current.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      const isoString = d.toISOString().split('T')[0];
      const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
      const dayNumber = d.getDate();
      const isToday = isoString === '2026-11-20'; // Reference date for current simulation
      const isSelected = isoString === selectedDate;

      days.push({
        date: d,
        isoString,
        dayLetter,
        dayNumber,
        isToday,
        isSelected,
      });
    }
    return days;
  }, [viewDate, selectedDate]);

  // Formatted Month and Year (e.g. "November 2026")
  const monthYearLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const handlePrevWeek = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() - 7);
    setViewDate(next);
    audioService.playClick();
  };

  const handleNextWeek = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + 7);
    setViewDate(next);
    audioService.playClick();
  };

  const handleSelectDay = (isoString: string) => {
    setSelectedDate(isoString);
    audioService.playCallRegistered();
    onDateChange?.(isoString);
  };

  return (
    <div className={`p-3 bg-white rounded-[8px] border border-[#DCDFEA] shadow-xs select-none ${className}`}>
      {/* 
        ROW 1: Dedicated Month & Year Header 
        Strictly isolated from the day columns below to eliminate ANY text overlap or glyph collisions! 
      */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#DCDFEA]/60">
        <div className="flex items-center space-x-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-[#433690]" />
          <span className="text-xs font-bold text-[#1E2232] tracking-tight">
            {monthYearLabel}
          </span>
        </div>

        {/* Navigation Arrows for Previous / Next Week */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrevWeek}
            title="Previous Week"
            className="p-1 rounded-[4px] text-[#5D6375] hover:text-[#1E2232] hover:bg-[#EEF0F6] transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            title="Next Week"
            className="p-1 rounded-[4px] text-[#5D6375] hover:text-[#1E2232] hover:bg-[#EEF0F6] transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 
        ROW 2: Daily Columns Track 
        Divided columns with clear vertical spacing between day letter, date badge, and "Today" indicator
      */}
      <div className="grid grid-cols-7 divide-x divide-[#DCDFEA] text-center">
        {weekDays.map((d) => (
          <div
            key={d.isoString}
            onClick={() => handleSelectDay(d.isoString)}
            className={`flex flex-col items-center py-1.5 px-0.5 cursor-pointer transition-all rounded-[4px] ${
              d.isSelected
                ? 'bg-[#E6E3F7]/50 font-bold'
                : 'hover:bg-slate-50'
            }`}
          >
            {/* Weekday Letter (T, F, etc.) with generous bottom margin so it NEVER collides with headers */}
            <span className="text-[11px] font-semibold text-[#5D6375] mb-1.5 leading-none">
              {d.dayLetter}
            </span>

            {/* Date Pill Badge */}
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                d.isToday
                  ? 'bg-[#E6F4EA] border border-[#15804D]/40 text-[#15804D] shadow-2xs'
                  : d.isSelected
                  ? 'bg-[#433690] text-white shadow-xs'
                  : 'text-[#1E2232]'
              }`}
            >
              {d.dayNumber}
            </div>

            {/* "Today" Text Label (Rendered beneath the date badge with guaranteed clearance) */}
            <div className="h-4 flex items-center justify-center mt-0.5">
              {d.isToday && (
                <span className="text-[9px] font-bold text-[#15804D] leading-none tracking-tight">
                  Today
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
