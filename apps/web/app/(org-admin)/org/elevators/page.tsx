'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Activity,
  Building2,
  Plus,
  Sliders,
  Radio,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ElevatorInventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('Apex Financial Tower A');
  const [manufacturer, setManufacturer] = useState('KONE');
  const [speed, setSpeed] = useState('2.0 m/s');
  const [capacity, setCapacity] = useState('1,350 kg (18 pass)');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [elevators, setElevators] = useState([
    {
      id: 'elv-a-01',
      code: 'ELV-A-01',
      name: 'Passenger Car 1 (High-Speed)',
      building: 'Apex Financial Tower A',
      wing: 'North Core',
      manufacturer: 'KONE',
      model: 'MiniSpace KONE EcoDisc',
      speed: '2.5 m/s',
      capacity: '1,350 kg (18 pass)',
      controller: 'KONE KCE (CiA 417)',
      gateway: 'GW-ELV-A-01',
      gwStatus: 'ONLINE',
      status: 'RUNNING',
    },
    {
      id: 'elv-a-02',
      code: 'ELV-A-02',
      name: 'Passenger Car 2 (Standard)',
      building: 'Apex Financial Tower A',
      wing: 'North Core',
      manufacturer: 'Otis',
      model: 'Gen2 Life ReGen',
      speed: '1.75 m/s',
      capacity: '1,000 kg (13 pass)',
      controller: 'Otis GECB (Modbus RTU)',
      gateway: 'GW-ELV-A-02',
      gwStatus: 'ONLINE',
      status: 'IDLE',
    },
    {
      id: 'elv-a-03',
      code: 'ELV-A-03',
      name: 'Service & Freight Car 3',
      building: 'Apex Financial Tower A',
      wing: 'North Core',
      manufacturer: 'Schindler',
      model: 'Schindler 5500 MRL',
      speed: '1.6 m/s',
      capacity: '2,000 kg (26 pass)',
      controller: 'Schindler CO MX',
      gateway: 'GW-ELV-A-03',
      gwStatus: 'ONLINE',
      status: 'RUNNING',
    },
    {
      id: 'elv-a-04',
      code: 'ELV-A-04',
      name: 'Firefighters & Emergency Car 4',
      building: 'Apex Financial Tower A',
      wing: 'North Core',
      manufacturer: 'TK Elevator',
      model: 'evolution 200 Heavy Duty',
      speed: '2.0 m/s',
      capacity: '1,250 kg (16 pass)',
      controller: 'TKE TAC50',
      gateway: 'GW-ELV-A-04',
      gwStatus: 'ONLINE',
      status: 'IDLE',
    },
  ]);

  const handleAddElevator = (e: React.FormEvent) => {
    e.preventDefault();
    const assetCode = code || `ELV-B-0${elevators.length + 1}`;
    const newElv = {
      id: assetCode.toLowerCase(),
      code: assetCode,
      name: name || `Passenger Car ${elevators.length + 1}`,
      building,
      wing: 'North Core',
      manufacturer,
      model: `${manufacturer} High-Performance Series`,
      speed,
      capacity,
      controller: `${manufacturer} Digital Controller`,
      gateway: `GW-${assetCode}`,
      gwStatus: 'ONLINE',
      status: 'IDLE',
    };
    setElevators([...elevators, newElv]);
    setIsModalOpen(false);
    setCode('');
    setName('');
    setSuccessBanner(`Elevator ${newElv.code} successfully provisioned and linked to gateway.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Equipment Inventory' }, { label: 'Elevator Fleet' }]}
      title="Elevator Equipment & Controller Registry"
      subtitle="Complete portfolio of traction elevators, controller bus profiles, edge gateways and declared OEM capabilities"
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Register Elevator
        </Button>
      }
    >
      {successBanner && (
        <div className="mb-4 p-3 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] text-xs font-medium flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-[#15804D] hover:underline font-bold">Dismiss</button>
        </div>
      )}

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-page/60 border-b border-card-border text-muted font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Elevator Name</th>
                <th className="py-3 px-4">Manufacturer & Model</th>
                <th className="py-3 px-4">Rated Specs</th>
                <th className="py-3 px-4">Controller Profile</th>
                <th className="py-3 px-4">IoT Gateway</th>
                <th className="py-3 px-4">Live State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA]">
              {elevators.map((elv) => (
                <tr key={elv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#433690]">{elv.code}</td>
                  <td className="px-4 font-semibold text-[#1E2232]">{elv.name}</td>
                  <td className="px-4">
                    <div className="font-medium text-[#1E2232]">{elv.manufacturer}</div>
                    <div className="text-[11px] text-[#5D6375] font-mono">{elv.model}</div>
                  </td>
                  <td className="px-4 font-mono text-[11px] text-[#5D6375]">
                    <div>{elv.capacity}</div>
                    <div className="text-[10px] text-[#5D6375]">{elv.speed}</div>
                  </td>
                  <td className="px-4 font-mono text-[11px] text-[#1E2232]">{elv.controller}</td>
                  <td className="px-4 font-mono text-[11px]">
                    <div className="text-[#1E2232] font-semibold">{elv.gateway}</div>
                    <div className="text-[#15804D] text-[10px] flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-st-running"></span>
                      <span>ONLINE</span>
                    </div>
                  </td>
                  <td className="px-4">
                    <StatusBadge status={elv.status} size="sm" />
                  </td>
                  <td className="px-4 text-right">
                    <Link href={`/elevators/${elv.id}/live`}>
                      <Button variant="outline" size="sm" icon={<Activity className="h-3.5 w-3.5" />}>
                        Live Shaft
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register Elevator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Elevator & Hardware Mapping"
        subtitle="Provision a hoistway car asset, OEM bus adapter, and link to an IoT Edge Gateway"
      >
        <form onSubmit={handleAddElevator} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Asset Code</label>
              <input
                type="text"
                placeholder="e.g. ELV-B-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Elevator Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Passenger Car 5 (Executive)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Building</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                <option value="Apex Financial Tower A">Apex Financial Tower A</option>
                <option value="Apex Financial Tower B">Apex Financial Tower B</option>
                <option value="Skyline Luxury Residences">Skyline Luxury Residences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">OEM Manufacturer</label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                <option value="KONE">KONE</option>
                <option value="Otis">Otis</option>
                <option value="Schindler">Schindler</option>
                <option value="TK Elevator">TK Elevator</option>
                <option value="Mitsubishi">Mitsubishi Electric</option>
                <option value="Generic Modbus">Generic Modbus/CAN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Rated Speed</label>
              <input
                type="text"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Rated Capacity</label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
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
              Register Elevator
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
