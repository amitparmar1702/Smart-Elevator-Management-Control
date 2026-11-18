'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EEF0F6] flex flex-col justify-center items-center px-4 text-[#1E2232]">
      <div className="w-full max-w-md bg-white p-8 rounded-[10px] border border-[#DCDFEA] shadow-card text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-[#E6E3F7] text-[#433690]">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#433690] tracking-tight">
          404 · Page Not Found
        </h1>

        <p className="text-xs text-[#5D6375] leading-relaxed">
          The requested floor, elevator shaft, or operational telemetry view does not exist in the active fleet registry.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full" icon={<Home className="h-4 w-4" />}>
              Fleet Dashboard
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full" icon={<ArrowLeft className="h-4 w-4" />}>
              Sign In
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#DCDFEA] text-[11px] text-[#5D6375] font-mono">
          ElevateOS Fleet Operations · Gateway Connected
        </div>
      </div>
    </div>
  );
}
