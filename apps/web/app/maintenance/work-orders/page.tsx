'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  Clock, 
  HardHat, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export type WorkOrderStatus = 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';

interface WorkOrder {
  id: string;
  elevator: string;
  type: string;
  priority: string;
  status: WorkOrderStatus;
  technician: string;
  dueDate: string;
  slaStatus: string;
}

export default function WorkOrdersPage() {
  const [filterType, setFilterType] = useState('ALL');
  const [returnToServiceTarget, setReturnToServiceTarget] = useState<WorkOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newElv, setNewElv] = useState('ELV-A-01 (Car 1 High-Speed)');
  const [newType, setNewType] = useState('Preventive service');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newTech, setNewTech] = useState('Arjun Rao');
  const [newDueDate, setNewDueDate] = useState('Tomorrow, 10:00');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [orders, setOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-1092',
      elevator: 'ELV-A-01 (Car 1 High-Speed)',
      type: 'Preventive service',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      technician: 'Arjun Rao',
      dueDate: 'Today, 14:00',
      slaStatus: 'ON_TRACK',
    },
    {
      id: 'WO-1095',
      elevator: 'ELV-A-03 (Car 3 Freight)',
      type: 'Breakdown repair',
      priority: 'HIGH',
      status: 'ASSIGNED',
      technician: 'Vikram Singh',
      dueDate: 'Today, 17:00',
      slaStatus: 'ON_TRACK',
    },
    {
      id: 'WO-1097',
      elevator: 'ELV-B-02 (Low-Rise North)',
      type: 'Sensor calibration',
      priority: 'LOW',
      status: 'UNASSIGNED',
      technician: 'Unassigned',
      dueDate: 'Tomorrow',
      slaStatus: 'ON_TRACK',
    },
    {
      id: 'WO-1088',
      elevator: 'ELV-A-02 (Car 2 Standard)',
      type: 'Safety inspection',
      priority: 'LOW',
      status: 'DONE',
      technician: 'Vikram Singh',
      dueDate: 'Yesterday',
      slaStatus: 'MET',
    },
  ]);

  const handleAdvanceStatus = (order: WorkOrder) => {
    let nextStatus: WorkOrderStatus = 'ASSIGNED';
    if (order.status === 'UNASSIGNED') nextStatus = 'ASSIGNED';
    else if (order.status === 'ASSIGNED') nextStatus = 'IN_PROGRESS';
    else if (order.status === 'IN_PROGRESS') {
      // Trigger return-to-service prompt
      setReturnToServiceTarget(order);
      return;
    }

    setOrders(
      orders.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    );
  };

  const confirmMarkDone = (returnElevatorToService: boolean) => {
    if (!returnToServiceTarget) return;
    setOrders(
      orders.map((o) =>
        o.id === returnToServiceTarget.id ? { ...o, status: 'DONE' } : o
      )
    );
    setReturnToServiceTarget(null);
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `WO-${Math.floor(1100 + Math.random() * 8900)}`;
    const newOrder: WorkOrder = {
      id: newId,
      elevator: newElv,
      type: newType,
      priority: newPriority,
      status: 'ASSIGNED',
      technician: newTech,
      dueDate: newDueDate,
      slaStatus: 'ON_TRACK',
    };
    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
    setSuccessMsg(`Work order ${newId} issued successfully and assigned to ${newTech}.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const filtered = filterType === 'ALL' 
    ? orders 
    : orders.filter((o) => o.type.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Maintenance Management' }, { label: 'Work Orders' }]}
      title="Maintenance Work Orders & SLA Tracking"
      subtitle="Comprehensive preventive maintenance scheduling, breakdown repairs, and digital sign-offs"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Issue work order
        </Button>
      }
    >
      {successMsg && (
        <div className="mb-4 p-3 bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] rounded-[6px] text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold ml-2">&times;</button>
        </div>
      )}
      <Card noPadding>
        {/* Filters Bar */}
        <div className="p-4 border-b border-[#DCDFEA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { label: 'All orders', value: 'ALL' },
              { label: 'Preventive', value: 'Preventive' },
              { label: 'Breakdown', value: 'Breakdown' },
              { label: 'Inspection', value: 'Inspection' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`px-3 py-1.5 rounded-[6px] border transition-colors ${
                  filterType === tab.value
                    ? 'bg-[#433690] text-white border-[#433690]'
                    : 'bg-[#EEF0F6] text-[#5D6375] border-[#DCDFEA] hover:text-[#1E2232]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#5D6375] font-mono">
            Showing {filtered.length} work orders
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[880px]">
            <thead className="bg-[#EEF0F6]/60 border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order number</th>
                <th className="py-3 px-4">Elevator asset</th>
                <th className="py-3 px-4">Maintenance type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned technician</th>
                <th className="py-3 px-4">SLA deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Workflow action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA]">
              {filtered.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#433690]">
                    {wo.id}
                  </td>
                  <td className="px-4 font-medium text-[#1E2232]">
                    {wo.elevator}
                  </td>
                  <td className="px-4 text-[#5D6375]">
                    {wo.type}
                  </td>
                  <td className="px-4">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${
                        wo.priority === 'HIGH'
                          ? 'bg-[#F8DDDC] text-[#C92D29]'
                          : wo.priority === 'MEDIUM'
                          ? 'bg-[#F6E9D2] text-[#9C5C00]'
                          : 'bg-[#EEF0F6] text-[#5D6375]'
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </td>
                  <td className="px-4 text-[#1E2232] font-medium">
                    {wo.technician}
                  </td>
                  <td className="px-4 font-mono text-[#5D6375]">
                    {wo.dueDate}
                  </td>
                  <td className="px-4">
                    <StatusBadge
                      status={
                        wo.status === 'DONE'
                          ? 'Completed'
                          : wo.status === 'IN_PROGRESS'
                          ? 'In progress'
                          : wo.status === 'ASSIGNED'
                          ? 'Acknowledged'
                          : 'Pending'
                      }
                      size="sm"
                    />
                  </td>
                  <td className="px-4 text-right">
                    {wo.status !== 'DONE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdvanceStatus(wo)}
                      >
                        {wo.status === 'UNASSIGNED'
                          ? 'Assign'
                          : wo.status === 'ASSIGNED'
                          ? 'Start job'
                          : 'Mark done'}
                      </Button>
                    ) : (
                      <span className="text-[11px] font-mono font-semibold text-[#15804D] flex items-center justify-end space-x-1">
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Signed off</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Return-to-Service Confirmation Prompt */}
      {returnToServiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-md w-full p-5 text-[#1E2232] animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#DCDFEA]">
              <ShieldCheck className="h-5 w-5 text-[#15804D]" />
              <h3 className="font-medium text-base text-[#15804D]">
                Work order completion sign-off
              </h3>
            </div>

            <div className="my-4 text-xs space-y-2">
              <p>
                Work order <strong>{returnToServiceTarget.id}</strong> on{' '}
                <strong>{returnToServiceTarget.elevator}</strong> is ready to be marked as <strong>Done</strong>.
              </p>
              <div className="p-3 bg-[#EEF0F6] rounded-[6px] border border-[#DCDFEA]">
                <p className="font-semibold text-[#1E2232]">
                  Return elevator to normal service?
                </p>
                <p className="text-[#5D6375] text-[11px] mt-1">
                  Re-enables landing calls and adds the car back into the group dispatch algorithm.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#DCDFEA]">
              <Button variant="outline" size="sm" onClick={() => confirmMarkDone(false)}>
                Keep in maintenance
              </Button>
              <Button variant="success" size="sm" onClick={() => confirmMarkDone(true)}>
                Return to service
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Work Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-lg w-full p-4 sm:p-5 text-[#1E2232] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCDFEA]">
              <div className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-[#433690]" />
                <h3 className="font-medium text-base text-[#433690]">
                  Issue New Maintenance Work Order
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#5D6375] hover:text-[#1E2232] p-1 rounded-md"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#5D6375] mb-1">Target Elevator Car</label>
                <select
                  value={newElv}
                  onChange={(e) => setNewElv(e.target.value)}
                  className="w-full h-10 px-3 border border-[#DCDFEA] rounded-[6px] bg-white text-[#1E2232]"
                >
                  <option value="ELV-A-01 (Car 1 High-Speed)">ELV-A-01 (Car 1 High-Speed Passenger)</option>
                  <option value="ELV-A-02 (Car 2 Standard)">ELV-A-02 (Car 2 Standard Passenger)</option>
                  <option value="ELV-A-03 (Car 3 Freight)">ELV-A-03 (Car 3 Heavy Freight / Service)</option>
                  <option value="ELV-A-04 (Car 4 Fire/Emergency)">ELV-A-04 (Car 4 Fire / Emergency)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#5D6375] mb-1">Work Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-10 px-3 border border-[#DCDFEA] rounded-[6px] bg-white text-[#1E2232]"
                  >
                    <option value="Preventive service">Preventive service</option>
                    <option value="Breakdown repair">Breakdown repair</option>
                    <option value="Safety inspection">Safety inspection</option>
                    <option value="Sensor calibration">Sensor calibration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#5D6375] mb-1">Priority SLA</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full h-10 px-3 border border-[#DCDFEA] rounded-[6px] bg-white text-[#1E2232]"
                  >
                    <option value="CRITICAL">Critical (P1 - 1hr)</option>
                    <option value="HIGH">High (P2 - 4hr)</option>
                    <option value="MEDIUM">Medium (P3 - 24hr)</option>
                    <option value="LOW">Low (P4 - Routine)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#5D6375] mb-1">Assigned Technician</label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full h-10 px-3 border border-[#DCDFEA] rounded-[6px] bg-white text-[#1E2232]"
                  >
                    <option value="Vikram Singh">Vikram Singh (Traction Lead)</option>
                    <option value="Arjun Rao">Arjun Rao (Door Specialist)</option>
                    <option value="Kavita Nair">Kavita Nair (Safety Inspector)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#5D6375] mb-1">Due Date</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full h-10 px-3 border border-[#DCDFEA] rounded-[6px] bg-white text-[#1E2232]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#DCDFEA]">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Dispatch work order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
