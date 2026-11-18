'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Layers,
  MapPin,
  Plus,
  ShieldCheck,
  ArrowRight,
  Lock
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Building {
  id: string;
  code: string;
  name: string;
  address: string;
  wings: string[];
  floors: number;
  elevators: number;
  manager: string;
  restrictedFloors: string[];
}

export default function BuildingsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [floors, setFloors] = useState(18);
  const [elevatorsCount, setElevatorsCount] = useState(3);
  const [manager, setManager] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: 'bldg-apex-twr-a',
      code: 'APX-TWR-A',
      name: 'Apex Financial Tower A',
      address: 'Plot 42, Bandra Kurla Complex, Mumbai',
      wings: ['North Core', 'East Executive Core'],
      floors: 22,
      elevators: 4,
      manager: 'Priya Deshmukh',
      restrictedFloors: ['Floor 19 (Executive Suite)', 'Floor 20 (Machinery Room)', 'Basement 2'],
    },
    {
      id: 'bldg-emr-bay',
      code: 'EMR-BAY-01',
      name: 'Emerald Business Bay Core',
      address: '77 Marine Promenade, Tower 2, Mumbai',
      wings: ['Podium Wing', 'High-Rise Tower'],
      floors: 34,
      elevators: 6,
      manager: 'Rajesh Kulkarni',
      restrictedFloors: ['Floor 33 (Helipad Staging)', 'Floor 34 (Penthouse Lounge)', 'Basement 3'],
    },
    {
      id: 'bldg-hrz-res',
      code: 'HRZ-RES-03',
      name: 'Grand Horizon Residence',
      address: '14 Parkside Avenue, Worli, Mumbai',
      wings: ['Residential Wing A', 'Service Core'],
      floors: 18,
      elevators: 3,
      manager: 'Meera Sen',
      restrictedFloors: ['Floor 18 (Rooftop Machinery Vault)'],
    },
  ]);

  const handleAddBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    const newBldg: Building = {
      id: 'bldg-' + (code || name).toLowerCase().replace(/\s+/g, '-'),
      code: code || 'BLDG-' + (buildings.length + 1),
      name,
      address,
      wings: ['Main Core'],
      floors: Number(floors),
      elevators: Number(elevatorsCount),
      manager: manager || 'Operations Lead',
      restrictedFloors: [`Floor ${floors} (Machinery Vault)`],
    };
    setBuildings([...buildings, newBldg]);
    setIsModalOpen(false);
    setName('');
    setCode('');
    setAddress('');
    setManager('');
    setSuccessBanner(`Building ${newBldg.name} (${newBldg.code}) registered successfully.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Portfolio Assets' }, { label: 'Buildings & Floors' }]}
      title="Property Portfolio & Floor Hierarchy"
      subtitle="Commercial complexes, residential towers, wings, and floor access permissions"
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Register Property
        </Button>
      }
    >
      {successBanner && (
        <div className="mb-4 p-3 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] text-xs font-medium flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-[#15804D] hover:underline font-bold">Dismiss</button>
        </div>
      )}

      <div className="space-y-6">
        {buildings.map((b) => (
          <Card
            key={b.id}
            title={b.name}
            subtitle={b.address}
            action={
              <Link href="/org/elevators">
                <Button variant="outline" size="sm">
                  Manage Shafts ({b.elevators})
                </Button>
              </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3 border-b border-[#DCDFEA] text-xs">
              <div>
                <span className="text-[#5D6375] block text-[10px] uppercase font-mono">FACILITY CODE</span>
                <span className="font-mono font-bold text-[#1E2232]">{b.code}</span>
              </div>
              <div>
                <span className="text-[#5D6375] block text-[10px] uppercase font-mono">TOTAL FLOORS</span>
                <span className="font-mono font-bold text-[#1E2232]">{b.floors} Levels (B2 to L20)</span>
              </div>
              <div>
                <span className="text-[#5D6375] block text-[10px] uppercase font-mono">ELEVATOR SHAFTS</span>
                <span className="font-mono font-bold text-[#1E2232]">{b.elevators} Active Cars</span>
              </div>
              <div>
                <span className="text-[#5D6375] block text-[10px] uppercase font-mono">ASSIGNED FACILITY MGR</span>
                <span className="font-semibold text-[#433690]">{b.manager}</span>
              </div>
            </div>

            {/* Wings & Restricted Floor Policies */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-semibold text-[#433690] mb-2 flex items-center space-x-1.5 text-xs">
                  <Layers className="h-4 w-4 text-[#5D6375]" />
                  <span>Configured Cores / Wings</span>
                </h4>
                <div className="space-y-1.5">
                  {b.wings.map((w) => (
                    <div key={w} className="p-2 rounded-[6px] bg-[#EEF0F6] border border-[#DCDFEA] font-medium text-[#1E2232]">
                      {w}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#9C5C00] mb-2 flex items-center space-x-1.5 text-xs">
                  <Lock className="h-4 w-4 text-[#9C5C00]" />
                  <span>Restricted Floor Access Policies</span>
                </h4>
                <div className="space-y-1.5">
                  {b.restrictedFloors.map((rf) => (
                    <div key={rf} className="p-2 rounded-[6px] bg-[#FFF4E5] border border-[#FFE2B8] text-[#9C5C00] font-mono text-[11px]">
                      {rf}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Register Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Property / Building Complex"
        subtitle="Provision a new facility record, floor hierarchy, and access boundaries"
      >
        <form onSubmit={handleAddBuilding} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Building Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Skyline Tower South"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Facility Code</label>
              <input
                type="text"
                placeholder="e.g. SKY-TWR-S"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Physical Address</label>
            <input
              type="text"
              required
              placeholder="e.g. 108 Financial Boulevard, Sector 5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Total Floors</label>
              <input
                type="number"
                min="1"
                max="120"
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Elevator Shafts</label>
              <input
                type="number"
                min="1"
                max="30"
                value={elevatorsCount}
                onChange={(e) => setElevatorsCount(Number(e.target.value))}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Facility Manager</label>
              <input
                type="text"
                placeholder="Manager name"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Property
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
