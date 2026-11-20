'use client';

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { WeekStripDatePicker } from '@/components/ui/WeekStripDatePicker';
import { audioService } from '@/lib/audioService';

export default function ResidentDashboard() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('Home Relocation / Heavy Move');
  const [bookingDate, setBookingDate] = useState('2026-11-20');
  const [bookingSlot, setBookingSlot] = useState('14:00 - 16:30');
  const [bookings, setBookings] = useState([
    {
      id: 'bkg-01',
      title: 'Furniture Delivery',
      date: 'Saturday, 14 Nov 2026',
      slot: '14:00 - 16:30',
      car: 'Car 3 Freight',
      status: 'APPROVED',
    },
  ]);
  const [pickupFloor, setPickupFloor] = useState(1);
  const [destinationFloor, setDestinationFloor] = useState(8);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'CALLING' | 'DISPATCHED' | 'ARRIVED'>('IDLE');
  const [assignedCar, setAssignedCar] = useState('Car 1 (High-Speed)');
  const [etaSeconds, setEtaSeconds] = useState(18);

  const handleCall = () => {
    audioService.playCallRegistered();
    setCallStatus('CALLING');
    setTimeout(() => {
      setCallStatus('DISPATCHED');
      const interval = setInterval(() => {
        setEtaSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            audioService.playArrivalChime();
            setCallStatus('ARRIVED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 800);
  };

  const handleReset = () => {
    setCallStatus('IDLE');
    setEtaSeconds(18);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Resident Portal' }, { label: 'My Elevators & Requests' }]}
      title="Resident Mobility Portal"
      subtitle="Request elevators, track car arrival countdown, and book service elevator time slots"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Elevator Call Request Card */}
        <Card title="Quick Elevator Call (Touchless Landing Request)">
          {callStatus === 'IDLE' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2232] mb-1">
                    Pickup Floor (Where you are):
                  </label>
                  <select
                    value={pickupFloor}
                    onChange={(e) => setPickupFloor(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold h-10 min-h-[40px] px-3 border border-[#DCDFEA] rounded-[8px] bg-white text-[#1E2232] focus:ring-2 focus:ring-[#433690]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14].map((f) => (
                      <option key={f} value={f}>
                        {f === 1 ? 'Floor 1 (Ground Floor)' : `Floor ${f}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2232] mb-1">
                    Destination Floor:
                  </label>
                  <select
                    value={destinationFloor}
                    onChange={(e) => setDestinationFloor(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold h-10 min-h-[40px] px-3 border border-[#DCDFEA] rounded-[8px] bg-white text-[#1E2232] focus:ring-2 focus:ring-[#433690]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14].map((f) => (
                      <option key={f} value={f}>
                        Floor {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCall}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Call Elevator (Destination Dispatch)
                </Button>
              </div>
            </div>
          )}

          {callStatus === 'CALLING' && (
            <div className="py-8 text-center text-xs text-[#5D6375]">
              <div className="animate-spin h-6 w-6 border-2 border-[#433690] border-t-transparent rounded-full mx-auto mb-2"></div>
              <span>Connecting to Apex Building Dispatch Controller...</span>
            </div>
          )}

          {callStatus === 'DISPATCHED' && (
            <div className="p-6 bg-[#E6E3F7] border border-[#433690]/30 rounded-[8px] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#433690] block mb-1">
                Elevator Allocated
              </span>
              <h3 className="text-xl font-bold text-[#1E2232]">{assignedCar}</h3>
              <p className="text-xs text-[#5D6375] mt-1">Please proceed to North Shaft Bank</p>

              <div className="my-4 py-3 px-6 bg-white rounded-[6px] inline-block border border-[#DCDFEA] shadow-xs">
                <span className="text-[11px] text-[#5D6375] block">ESTIMATED ARRIVAL IN</span>
                <span className="text-3xl font-extrabold font-mono text-[#433690]">{etaSeconds}s</span>
              </div>
            </div>
          )}

          {callStatus === 'ARRIVED' && (
            <div className="p-6 bg-[#DCEFE4] border border-[#15804D]/30 rounded-[8px] text-center">
              <CheckCircle2 className="h-10 w-10 text-[#15804D] mx-auto mb-2" />
              <h3 className="text-lg font-bold text-[#15804D]">{assignedCar} Has Arrived!</h3>
              <p className="text-xs text-[#15804D] mt-1">
                Doors are opening at Floor {pickupFloor}. Please board now.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Service Elevator Booking Card */}
        <Card
          title="Service Elevator Reservation (Moving & Deliveries)"
          subtitle="Reserve freight elevator for dedicated cargo or maintenance use"
          action={
            <Button
              variant="outline"
              size="sm"
              icon={<Calendar className="h-3.5 w-3.5" />}
              onClick={() => setIsBookingModalOpen(true)}
            >
              New Booking
            </Button>
          }
        >
          <div className="text-xs text-[#5D6375] space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-[#EEF0F6]/60 border border-[#DCDFEA] rounded-[6px] flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-[#1E2232]">Upcoming Booking: {b.title}</span>
                  <div className="text-[11px] text-[#5D6375] mt-0.5">
                    Scheduled for {b.date} | {b.slot} ({b.car})
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${b.status === 'APPROVED' ? 'bg-[#DCEFE4] text-[#15804D] border border-[#15804D]/30' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                  ● {b.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Service Elevator Reservation Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Reserve Service / Freight Elevator"
        subtitle="Submit a dedicated freight elevator reservation for move-in, deliveries, or contractors"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newBkg = {
              id: 'bkg-' + Date.now().toString().slice(-4),
              title: bookingTitle,
              date: bookingDate,
              slot: bookingSlot,
              car: 'Car 3 Freight',
              status: 'APPROVED',
            };
            setBookings([newBkg, ...bookings]);
            setIsBookingModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Reservation Purpose</label>
            <input
              type="text"
              required
              value={bookingTitle}
              onChange={(e) => setBookingTitle(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              placeholder="e.g. Home Furnishings Delivery"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1E2232]">Select Reservation Date</label>
            <WeekStripDatePicker
              initialDate={bookingDate}
              onDateChange={(d) => setBookingDate(d)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Time Slot Window</label>
              <select
                value={bookingSlot}
                onChange={(e) => setBookingSlot(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                <option value="09:00 - 11:30">Morning: 09:00 - 11:30</option>
                <option value="12:00 - 14:30">Midday: 12:00 - 14:30</option>
                <option value="14:00 - 16:30">Afternoon: 14:00 - 16:30</option>
                <option value="17:00 - 19:30">Evening: 17:00 - 19:30</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBookingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
