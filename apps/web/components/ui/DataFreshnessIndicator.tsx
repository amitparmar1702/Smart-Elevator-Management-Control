import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface DataFreshnessIndicatorProps {
  lastUpdated?: string | Date;
  onConnectionLost?: (lost: boolean) => void;
  className?: string;
}

export function DataFreshnessIndicator({
  lastUpdated,
  onConnectionLost,
  className = '',
}: DataFreshnessIndicatorProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateAge = () => {
      if (!lastUpdated) {
        setSecondsAgo(0);
        return;
      }
      const updatedTime = new Date(lastUpdated).getTime();
      const diffSec = Math.max(0, Math.floor((Date.now() - updatedTime) / 1000));
      setSecondsAgo(diffSec);

      if (diffSec > 600) {
        onConnectionLost?.(true);
      } else {
        onConnectionLost?.(false);
      }
    };

    updateAge();
    const interval = setInterval(updateAge, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, onConnectionLost]);

  // Determine freshness tier:
  // Tier 1: < 120s (2 min) -> Green dot, "Live, updated X sec ago"
  // Tier 2: 120s - 600s (10 min) -> Amber dot, "No data for X min"
  // Tier 3: > 600s -> Red dot, "Connection lost"
  if (secondsAgo < 120) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-page border border-card-border text-main ${className}`}>
        <span className="h-2 w-2 rounded-full bg-st-running animate-pulse" />
        <span>Live, updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}</span>
      </div>
    );
  }

  if (secondsAgo <= 600) {
    const minutes = Math.floor(secondsAgo / 60);
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-st-warning-bg border border-amber-300 text-st-warning ${className}`}>
        <span className="h-2 w-2 rounded-full bg-st-warning" />
        <span>No data for {minutes} min</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-st-alarm-bg border border-red-300 text-st-alarm font-bold ${className}`}>
      <span className="h-2 w-2 rounded-full bg-st-alarm" />
      <WifiOff className="h-3 w-3" />
      <span>Connection lost</span>
    </div>
  );
}
