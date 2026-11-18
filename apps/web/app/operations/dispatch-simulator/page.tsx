'use client';

import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Play
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GroupDispatcher, LandingCallRequest, GroupDispatchResult } from '@elevateos/shared';
import { ElevatorTelemetry } from '@elevateos/types';
import { audioService } from '@/lib/audioService';

export default function DispatchSimulatorPage() {
  const [pickupFloor, setPickupFloor] = useState<number>(5);
  const [destinationFloor, setDestinationFloor] = useState<number>(14);
  const [callDirection, setCallDirection] = useState<'UP' | 'DOWN'>('UP');
  const [passengerCount, setPassengerCount] = useState<number>(2);

  // 4 Cars in Bank A
  const [fleetCars] = useState<ElevatorTelemetry[]>([
    {
      elevatorId: 'Car A1 (High-Speed)',
      timestamp: new Date().toISOString(),
      floor: 1.0,
      targetFloor: null,
      direction: 'STATIONARY',
      velocityMps: 2.5,
      doorState: 'CLOSED',
      doorCycles: 12400,
      loadKg: 200,
      loadPercent: 20.0,
      isOverloaded: false,
      motorTempCelsius: 41.2,
      motorCurrentAmps: 0.8,
      vibrationRms: 0.035,
      controllerTempCelsius: 31.0,
      batteryVoltage: 27.2,
      safetyChainClosed: true,
      emergencyStopActive: false,
      gatewayConnected: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      elevatorId: 'Car A2 (Standard)',
      timestamp: new Date().toISOString(),
      floor: 4.0,
      targetFloor: 7.0,
      direction: 'UP',
      velocityMps: 1.75,
      doorState: 'CLOSED',
      doorCycles: 15300,
      loadKg: 420,
      loadPercent: 42.0,
      isOverloaded: false,
      motorTempCelsius: 44.5,
      motorCurrentAmps: 14.2,
      vibrationRms: 0.042,
      controllerTempCelsius: 32.5,
      batteryVoltage: 26.9,
      safetyChainClosed: true,
      emergencyStopActive: false,
      gatewayConnected: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      elevatorId: 'Car A3 (Freight / Service)',
      timestamp: new Date().toISOString(),
      floor: 12.0,
      targetFloor: 2.0,
      direction: 'DOWN',
      velocityMps: 1.6,
      doorState: 'CLOSED',
      doorCycles: 8900,
      loadKg: 1400,
      loadPercent: 70.0,
      isOverloaded: false,
      motorTempCelsius: 52.0,
      motorCurrentAmps: 22.0,
      vibrationRms: 0.055,
      controllerTempCelsius: 35.0,
      batteryVoltage: 26.5,
      safetyChainClosed: true,
      emergencyStopActive: false,
      gatewayConnected: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      elevatorId: 'Car A4 (VIP / Executive)',
      timestamp: new Date().toISOString(),
      floor: 8.0,
      targetFloor: null,
      direction: 'STATIONARY',
      velocityMps: 2.5,
      doorState: 'CLOSED',
      doorCycles: 6400,
      loadKg: 0,
      loadPercent: 0.0,
      isOverloaded: false,
      motorTempCelsius: 38.0,
      motorCurrentAmps: 0.5,
      vibrationRms: 0.025,
      controllerTempCelsius: 29.5,
      batteryVoltage: 27.4,
      safetyChainClosed: true,
      emergencyStopActive: false,
      gatewayConnected: true,
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const [lastResult, setLastResult] = useState<GroupDispatchResult | null>(null);

  const handleSimulateDispatch = () => {
    audioService.playCallRegistered();
    const request: LandingCallRequest = {
      pickupFloor,
      destinationFloor,
      direction: callDirection,
      passengerCount,
      timestamp: new Date().toISOString(),
    };

    const result = GroupDispatcher.dispatchLandingCall(request, fleetCars);
    setLastResult(result);
    if (result) {
      audioService.playArrivalChime();
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Operations' }, { label: 'Dispatch Optimizer' }]}
      title="Destination Dispatch Optimizer & Simulator"
      subtitle="Evaluate multi-car ETA cost algorithms, sector allocation heuristics, and passenger wait-time minimization"
    >
      <div className="space-y-6">
        {/* Call Injection Card */}
        <Card
          title="1. Inject Landing Hall Call"
          action={
            <Button
              size="sm"
              onClick={handleSimulateDispatch}
              icon={<Play className="w-4 h-4 fill-white" />}
            >
              Run Dispatch Optimization
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5D6375] mb-1">
                Pickup Floor
              </label>
              <select
                value={pickupFloor}
                onChange={(e) => setPickupFloor(Number(e.target.value))}
                className="w-full border border-[#DCDFEA] rounded-[8px] h-10 px-3 text-xs font-mono font-bold bg-white text-[#1E2232] focus:ring-2 focus:ring-[#433690]"
              >
                {[-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((fl) => (
                  <option key={fl} value={fl}>
                    Floor {fl > 0 ? `+${fl}` : fl} {fl === 1 ? '(Lobby)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D6375] mb-1">
                Destination Floor
              </label>
              <select
                value={destinationFloor}
                onChange={(e) => setDestinationFloor(Number(e.target.value))}
                className="w-full border border-[#DCDFEA] rounded-[8px] h-10 px-3 text-xs font-mono font-bold bg-white text-[#1E2232] focus:ring-2 focus:ring-[#433690]"
              >
                {[-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((fl) => (
                  <option key={fl} value={fl}>
                    Floor {fl > 0 ? `+${fl}` : fl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D6375] mb-1">
                Travel Direction
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCallDirection('UP')}
                  className={`flex-1 h-10 rounded-[8px] text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    callDirection === 'UP'
                      ? 'bg-[#433690] text-white border-[#433690] shadow-xs'
                      : 'bg-[#EEF0F6] text-[#5D6375] border-[#DCDFEA]'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" /> Up
                </button>
                <button
                  type="button"
                  onClick={() => setCallDirection('DOWN')}
                  className={`flex-1 h-10 rounded-[8px] text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    callDirection === 'DOWN'
                      ? 'bg-[#433690] text-white border-[#433690] shadow-xs'
                      : 'bg-[#EEF0F6] text-[#5D6375] border-[#DCDFEA]'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" /> Down
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D6375] mb-1">
                Passenger Group Size
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="w-full border border-[#DCDFEA] rounded-[8px] h-10 px-3 text-xs bg-white text-[#1E2232] focus:ring-2 focus:ring-[#433690]"
              />
            </div>
          </div>
        </Card>

        {/* Assigned Winner Banner if available */}
        {lastResult && (
          <div className="p-4 bg-[#15804D] text-white rounded-[8px] shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-[#DCEFE4] flex-shrink-0" />
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#DCEFE4]">
                  Optimal Car Allocated by Algorithm
                </span>
                <h3 className="text-lg font-bold tracking-tight">
                  {lastResult.assignedElevatorId}
                </h3>
                <p className="text-xs text-[#DCEFE4] mt-0.5">
                  Estimated Waiting Time: <strong>{lastResult.assignedCarEtaSeconds}s</strong> to Floor {pickupFloor} (Heading {lastResult.recommendedLandingIndicator})
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wide">
                DISPATCH COMMITTED
              </span>
            </div>
          </div>
        )}

        {/* 4 Cars Fleet Evaluation Matrix */}
        <div>
          <h3 className="text-sm font-medium text-[#433690] uppercase tracking-wider mb-3">
            2. Real-Time Elevator Bank Candidate Evaluations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {fleetCars.map((car) => {
              const evaluation = lastResult?.allEvaluations?.find(
                (e: any) => e.elevatorId === car.elevatorId
              );
              const isAssigned = lastResult?.assignedElevatorId === car.elevatorId;

              return (
                <Card
                  key={car.elevatorId}
                  className={`p-5 transition-all ${
                    isAssigned
                      ? 'border-2 border-[#15804D] shadow-card ring-2 ring-[#15804D]/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#1E2232]">{car.elevatorId}</span>
                    {isAssigned && (
                      <span className="text-[10px] bg-[#DCEFE4] text-[#15804D] font-bold px-2 py-0.5 rounded-full">
                        ● ALLOCATED
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-[#EEF0F6] p-2 rounded-[6px]">
                      <span className="text-[10px] text-[#5D6375] block uppercase font-mono">Position</span>
                      <strong className="text-[#1E2232] font-mono text-sm">Floor {car.floor}</strong>
                    </div>
                    <div className="bg-[#EEF0F6] p-2 rounded-[6px]">
                      <span className="text-[10px] text-[#5D6375] block uppercase font-mono">Direction</span>
                      <span className="font-semibold text-[#1E2232] flex items-center gap-1 font-mono text-xs mt-0.5">
                        {car.direction === 'UP' ? (
                          <ArrowUp className="w-3 h-3 text-[#15804D]" />
                        ) : car.direction === 'DOWN' ? (
                          <ArrowDown className="w-3 h-3 text-[#9C5C00]" />
                        ) : null}
                        {car.direction}
                      </span>
                    </div>
                    <div className="bg-[#EEF0F6] p-2 rounded-[6px] col-span-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#5D6375] uppercase font-mono">Cabin Load:</span>
                      <span className="font-semibold text-[#1E2232] font-mono">{car.loadPercent}% ({car.loadKg}kg)</span>
                    </div>
                  </div>

                  {evaluation && (
                    <div className="pt-2 border-t border-[#DCDFEA] space-y-1.5 text-xs">
                      <div className="flex justify-between py-0.5">
                        <span className="text-[#5D6375]">Distance to Call:</span>
                        <span className="font-mono font-bold text-[#1E2232]">{evaluation.distanceFloors} Floors</span>
                      </div>

                      <div className="flex justify-between py-0.5">
                        <span className="text-[#5D6375]">Calculated ETA:</span>
                        <span className="font-mono font-bold text-[#433690]">{evaluation.estimatedTimeToArrivalSeconds}s</span>
                      </div>

                      <div className="flex justify-between py-0.5">
                        <span className="text-[#5D6375]">Cost Score:</span>
                        <span className="font-mono font-bold text-[#1E2232]">{evaluation.totalCostScore}</span>
                      </div>

                      {!evaluation.isEligible && (
                        <div className="p-2 bg-[#F8DDDC] text-[#C92D29] rounded-[4px] text-[11px] mt-2">
                          {evaluation.disqualificationReason}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
