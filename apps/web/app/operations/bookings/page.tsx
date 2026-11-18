'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Building2 
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export default function BookingsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState([
    {
      id: 'BKG-4421',
      elevator: 'Car 3 (Freight & Service)',
      building: 'Apex Financial Tower A',
      purpose: 'FURNITURE_DELIVERY',
      startTime: 'Tomorrow, 14:00',
      endTime: 'Tomorrow, 16:30',
      contact: 'Aarav Patel (Apt 1402)',
      status: 'APPROVED',
    },
    {
      id: 'BKG-4422',
      elevator: 'Car 3 (Freight & Service)',
      building: 'Apex Financial Tower A',
      purpose: 'COMMERCIAL_DELIVERY',
      startTime: '12 Nov 2026, 09:00',
      endTime: '12 Nov 2026, 11:00',
      contact: 'DHL Express Logistics',
      status: 'PENDING_APPROVAL',
    },
    {
      id: 'BKG-4419',
      elevator: 'Car 1 (High-Speed)',
      building: 'Apex Financial Tower A',
      purpose: 'VIP_RESERVATION',
      startTime: 'Yesterday, 10:00',
      endTime: 'Yesterday, 11:00',
      contact: 'Executive Committee',
      status: 'COMPLETED',
    },
  ]);

  const [formPurpose, setFormPurpose] = useState('MOVING');
  const [formElevator, setFormElevator] = useState('Car 3 (Freight & Service)');
  const [formContact, setFormContact] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newBkg = {
      id: 'BKG-' + (Math.floor(Math.random() * 9000) + 1000),
      elevator: formElevator,
      building: 'Apex Financial Tower A',
      purpose: formPurpose,
      startTime: '15 Nov 2026, 10:00',
      endTime: '15 Nov 2026, 12:30',
      contact: formContact || 'Resident Request',
      status: 'PENDING_APPROVAL',
    };
    setBookings([newBkg, ...bookings]);
    setIsModalOpen(false);
    setFormContact('');
  };

  const handleApprove = (id: string) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'APPROVED' } : b)));
  };

  const handleReject = (id: string) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'REJECTED' } : b)));
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Facility Operations' }, { label: 'Elevator Bookings' }]}
      title="Elevator Service Reservations & Scheduling"
      subtitle="Manage freight elevator bookings, moving coordination, and conflict-free calendar slots"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          New Reservation
        </Button>
      }
    >
      {/* 3-KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">
            Upcoming Bookings
          </span>
          <div className="text-2xl font-bold text-[#1E2232] font-mono mt-1">
            {bookings.filter((b) => b.status === 'APPROVED').length} Confirmed
          </div>
          <span className="text-[11px] text-[#15804D] font-medium block mt-1">
            Dedicated Freight Car 3 reserved
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">
            Pending Manager Review
          </span>
          <div className="text-2xl font-bold text-[#9C5C00] font-mono mt-1">
            {bookings.filter((b) => b.status === 'PENDING_APPROVAL').length} Requests
          </div>
          <span className="text-[11px] text-[#9C5C00] font-medium block mt-1">
            Action required by building manager
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">
            Slot Conflict Engine
          </span>
          <div className="text-2xl font-bold text-[#15804D] font-mono mt-1">
            0 Conflicts
          </div>
          <span className="text-[11px] text-[#15804D] font-medium block mt-1">
            Automated calendar slot isolation
          </span>
        </Card>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-page/60 border-b border-card-border text-muted font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Elevator</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Contact / Tenant</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA]">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#433690]">{b.id}</td>
                  <td className="px-4 font-semibold text-[#1E2232]">{b.elevator}</td>
                  <td className="px-4 font-mono text-[11px] text-[#5D6375]">{b.purpose}</td>
                  <td className="px-4 text-[#5D6375] font-medium">{b.startTime} - {b.endTime}</td>
                  <td className="px-4 text-[#1E2232]">{b.contact}</td>
                  <td className="px-4">
                    <StatusBadge status={b.status === 'APPROVED' ? 'RUNNING' : b.status === 'PENDING_APPROVAL' ? 'WARNING' : b.status === 'REJECTED' ? 'ALARM' : 'OFFLINE'} />
                  </td>
                  <td className="px-4 text-right space-x-1.5">
                    {b.status === 'PENDING_APPROVAL' ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(b.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(b.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted text-[11px] font-mono">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Service Elevator Reservation"
        subtitle="Reserve freight elevator for dedicated cargo or maintenance use"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Select Dedicated Elevator:
            </label>
            <select
              value={formElevator}
              onChange={(e) => setFormElevator(e.target.value)}
              className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option>Car 3 (Freight & Service)</option>
              <option>Car 4 (Fire & Emergency)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Reservation Purpose:
            </label>
            <select
              value={formPurpose}
              onChange={(e) => setFormPurpose(e.target.value)}
              className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="MOVING">House Shifting / Relocation</option>
              <option value="FURNITURE_DELIVERY">Furniture / Appliance Delivery</option>
              <option value="COMMERCIAL_DELIVERY">Commercial Cargo & Bulk Delivery</option>
              <option value="SERVICE_MAINTENANCE">Contractor Renovation Work</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Contact Person / Flat Number:
            </label>
            <input
              type="text"
              required
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              placeholder="e.g. Rahul Verma (Apt 804)"
              className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Reservation
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

