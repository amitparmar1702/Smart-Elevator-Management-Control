'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors to monitoring
    console.error('ElevateOS Runtime Intercepted:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EEF0F6] flex flex-col justify-center items-center px-4 text-[#1E2232]">
      <div className="w-full max-w-lg bg-white p-8 rounded-[10px] border border-[#DCDFEA] shadow-card text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-[#F8DDDC] text-[#C92D29]">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#C92D29] tracking-tight">
          System Execution Recovered
        </h1>

        <p className="text-xs text-[#5D6375] leading-relaxed">
          An unexpected runtime fault occurred while rendering this fleet operational view. Hardware safety chains and elevator controllers remain 100% autonomous and unaffected.
        </p>

        {error?.message && (
          <div className="p-3 bg-[#F8FAFC] border border-[#DCDFEA] rounded-[6px] text-left">
            <span className="text-[10px] uppercase font-mono font-bold text-[#5D6375] block mb-1">
              Diagnostic Trace
            </span>
            <code className="text-xs font-mono text-[#C92D29] break-words">
              {error.message}
            </code>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => reset()}
          >
            Retry View
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              icon={<Home className="h-4 w-4" />}
            >
              Return to Fleet
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#DCDFEA] text-[11px] text-[#5D6375] font-mono">
          ElevateOS Safety Isolation Boundary Active
        </div>
      </div>
    </div>
  );
}
