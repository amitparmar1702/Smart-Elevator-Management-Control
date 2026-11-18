'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF0F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#1E2232] transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-[8px] bg-[#433690] text-white font-bold text-xl shadow-md mb-3">
          EO
        </div>
        <h2 className="text-2xl font-bold text-[#433690] tracking-tight">
          Reset Corporate Access
        </h2>
        <p className="mt-1 text-xs text-[#5D6375]">
          ElevateOS Security & Identity Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-card border border-[#DCDFEA] rounded-[8px] sm:px-10">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-4">
              <p className="text-xs text-[#5D6375] leading-relaxed">
                Enter your verified enterprise email address. An automated cryptographic password reset token will be dispatched to your inbox.
              </p>

              <div>
                <label htmlFor="recovery-email" className="block text-xs font-semibold text-[#1E2232] mb-1">
                  Enterprise Email
                </label>
                <div className="relative rounded-[8px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    suppressHydrationWarning
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 h-10 min-h-[40px] text-xs bg-white border border-[#DCDFEA] rounded-[8px] focus:ring-2 focus:ring-[#433690] text-[#1E2232]"
                    placeholder="officer@enterprise.com"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" size="md">
                  Send Recovery Link
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex p-3 rounded-full bg-[#DCEFE4] text-[#15804D]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-[#1E2232]">Recovery Email Dispatched</h3>
              <p className="text-xs text-[#5D6375]">
                If an account exists for <strong className="text-[#1E2232]">{email}</strong>, you will receive password reset instructions shortly.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[#DCDFEA] text-center">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 text-xs text-[#433690] font-semibold hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
