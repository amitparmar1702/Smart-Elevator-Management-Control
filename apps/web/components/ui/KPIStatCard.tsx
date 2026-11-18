import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface KPIStatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  period?: string; // e.g. "this week", "last 30 days", "today"
  change?: number; // e.g. +2.4 or -5
  delta?: number; // alias for change
  deltaPeriod?: string; // alias for comparison period
  upIsGood?: boolean; // false for faults/downtime/energy, true for availability/health
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function KPIStatCard({
  title,
  value,
  unit,
  period = 'this period',
  change,
  delta,
  deltaPeriod,
  upIsGood = true,
  icon,
  subtitle,
  className = '',
}: KPIStatCardProps) {
  const actualChange = change !== undefined ? change : delta;
  const hasChange = actualChange !== undefined && actualChange !== null;
  const isPositive = hasChange && actualChange > 0;
  const isNegative = hasChange && actualChange < 0;
  const isNeutral = hasChange && actualChange === 0;

  // Determine delta color:
  // If upIsGood: positive is green, negative is red
  // If !upIsGood (e.g. faults, downtime): positive is red, negative is green
  let deltaColor = 'text-muted';
  if (hasChange) {
    if (isPositive) {
      deltaColor = upIsGood ? 'text-st-running' : 'text-st-alarm';
    } else if (isNegative) {
      deltaColor = upIsGood ? 'text-st-alarm' : 'text-st-running';
    }
  }

  return (
    <Card className={`p-4 transition-all duration-150 ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">
          {title}
        </span>
        {icon && (
          <div className="p-1.5 rounded-md bg-page text-[#433690]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-main font-mono tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-muted font-medium">
            {unit}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px]">
        {hasChange ? (
          <span className={`inline-flex items-center font-medium font-mono ${deltaColor}`}>
            {isPositive && <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
            {isNegative && <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
            {isNeutral && <Minus className="h-3 w-3 mr-0.5" />}
            {isPositive ? `+${actualChange}` : actualChange}% {deltaPeriod || 'vs prev'}
          </span>
        ) : (
          <span className="text-muted">Current status</span>
        )}

        <span className="text-muted text-[10px]">
          {period}
        </span>
      </div>

      {subtitle && (
        <div className="mt-1 text-[11px] text-muted truncate">
          {subtitle}
        </div>
      )}
    </Card>
  );
}
