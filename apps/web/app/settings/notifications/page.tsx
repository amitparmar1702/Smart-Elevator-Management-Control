'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Check, 
  Save, 
  ShieldAlert, 
  Send 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NotificationService } from '@/services/notificationService';
import { NotificationRule } from '@/mocks/notificationMock';
import { audioService } from '@/lib/audioService';

export default function NotificationSettingsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await NotificationService.getNotificationMatrix();
      setRules(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleToggle = (ruleId: string, channel: 'push' | 'email' | 'sms' | 'whatsapp') => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          channels: {
            ...r.channels,
            [channel]: !r.channels[channel],
          },
        };
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await NotificationService.updateNotificationMatrix(rules);
    setIsSaving(false);
    audioService.playArrivalChime();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendTest = () => {
    audioService.playCallRegistered();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'System Settings' }, { label: 'Notification Channels' }]}
      title="Notification Routing & Alert Matrix"
      subtitle="Configure multi-channel alerting rules across mobile push, email, SMS, and WhatsApp per severity"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            icon={<Send className="h-4 w-4" />}
          >
            {testSent ? 'Test alert dispatched' : 'Send test alert'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            icon={<Save className="h-4 w-4" />}
          >
            Save preferences
          </Button>
        </div>
      }
    >
      {/* Toast Banner */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-[#DCEFE4] border border-[#15804D]/40 rounded-[6px] text-[#15804D] text-xs flex items-center space-x-2">
          <Check className="h-4 w-4" />
          <span>Notification routing matrix updated successfully.</span>
        </div>
      )}

      {testSent && (
        <div className="mb-4 p-3 bg-[#E6E3F7] border border-[#433690]/40 rounded-[6px] text-[#433690] text-xs flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Test emergency notification sent via configured SMS gateway and In-app push!</span>
        </div>
      )}

      <Card title="Alert subscription by incident classification" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-[#EEF0F6]/60 border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 min-w-[240px]">Event type & description</th>
                <th className="py-3 px-4 min-w-[120px]">Category</th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Bell className="h-3.5 w-3.5" />
                    <span>In-app push</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>SMS</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA]">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1E2232]">
                      {rule.label}
                    </div>
                    <div className="text-[11px] text-[#5D6375] mt-0.5">
                      {rule.description}
                    </div>
                  </td>
                  <td className="px-4">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[#EEF0F6] text-[#5D6375] border border-[#DCDFEA]">
                      {rule.category}
                    </span>
                  </td>
                  <td className="px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.channels.push}
                      onChange={() => handleToggle(rule.id, 'push')}
                      className="h-4 w-4 rounded text-[#433690] focus:ring-[#433690] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.channels.email}
                      onChange={() => handleToggle(rule.id, 'email')}
                      className="h-4 w-4 rounded text-[#433690] focus:ring-[#433690] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.channels.sms}
                      onChange={() => handleToggle(rule.id, 'sms')}
                      className="h-4 w-4 rounded text-[#433690] focus:ring-[#433690] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.channels.whatsapp}
                      onChange={() => handleToggle(rule.id, 'whatsapp')}
                      className="h-4 w-4 rounded text-[#433690] focus:ring-[#433690] cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
