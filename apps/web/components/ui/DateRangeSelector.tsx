import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export type DateShortcut = 'today' | '7d' | '30d' | 'this_month' | 'custom';

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  preset?: string;
}

interface DateRangeSelectorProps {
  initialRange?: DateRange;
  onChange?: (range: DateRange, shortcut: DateShortcut) => void;
  className?: string;
}

export function DateRangeSelector({
  initialRange,
  onChange,
  className = '',
}: DateRangeSelectorProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const d7Str = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const d30Str = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [activeShortcut, setActiveShortcut] = useState<DateShortcut>('30d');
  const [from, setFrom] = useState(initialRange?.from || d30Str);
  const [to, setTo] = useState(initialRange?.to || todayStr);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyShortcut = (shortcut: DateShortcut) => {
    setActiveShortcut(shortcut);
    let newFrom = from;
    let newTo = todayStr;

    if (shortcut === 'today') {
      newFrom = todayStr;
      newTo = todayStr;
    } else if (shortcut === '7d') {
      newFrom = d7Str;
      newTo = todayStr;
    } else if (shortcut === '30d') {
      newFrom = d30Str;
      newTo = todayStr;
    } else if (shortcut === 'this_month') {
      newFrom = firstDayOfMonth;
      newTo = todayStr;
    }

    setFrom(newFrom);
    setTo(newTo);
    setErrorMessage(null);
    onChange?.({ from: newFrom, to: newTo, preset: shortcut }, shortcut);
  };

  const handleCustomDateChange = (newFrom: string, newTo: string) => {
    setFrom(newFrom);
    setTo(newTo);
    setActiveShortcut('custom');

    if (newFrom && newTo && newFrom > newTo) {
      setErrorMessage('From date cannot be after To date');
    } else {
      setErrorMessage(null);
      onChange?.({ from: newFrom, to: newTo, preset: 'custom' }, 'custom');
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Shortcuts */}
        <div className="flex bg-page p-0.5 rounded-lg border border-card-border text-xs font-medium">
          <button
            type="button"
            onClick={() => applyShortcut('today')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeShortcut === 'today'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-muted hover:text-main'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => applyShortcut('7d')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeShortcut === '7d'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-muted hover:text-main'
            }`}
          >
            7 days
          </button>
          <button
            type="button"
            onClick={() => applyShortcut('30d')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeShortcut === '30d'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-muted hover:text-main'
            }`}
          >
            30 days
          </button>
          <button
            type="button"
            onClick={() => applyShortcut('this_month')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeShortcut === 'this_month'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-muted hover:text-main'
            }`}
          >
            This month
          </button>
        </div>

        {/* Custom From / To Inputs */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => handleCustomDateChange(e.target.value, to)}
            className="h-9 px-2 text-xs rounded-md bg-page border border-card-border text-main focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          />
          <span>To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => handleCustomDateChange(from, e.target.value)}
            className="h-9 px-2 text-xs rounded-md bg-page border border-card-border text-main focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          />
        </div>
      </div>

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-st-alarm font-medium pt-0.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
