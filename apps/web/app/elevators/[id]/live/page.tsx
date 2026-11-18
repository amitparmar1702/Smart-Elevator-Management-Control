'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  ShieldCheck, 
  Battery, 
  Radio, 
  DoorClosed,
  Zap,
  RotateCcw, 
  Flame, 
  ShieldAlert,
  Clock,
  Layers,
  Gauge,
  Video,
  Play,
  Pause,
  FastForward,
  Rewind,
  History,
  Camera,
  Eye,
  Maximize2,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ElevatorShaftVisualizer } from '@/components/shaft/ElevatorShaftVisualizer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { DataFreshnessIndicator } from '@/components/ui/DataFreshnessIndicator';
import { DateRangeSelector } from '@/components/ui/DateRangeSelector';
import { ElevatorTrendCharts } from '@/components/charts/ElevatorTrendCharts';
import { HealthScoreBreakdownModal } from '@/components/modals/HealthScoreBreakdownModal';
import { ElevatorEventTimeline } from '@/components/elevator/ElevatorEventTimeline';
import { FloorHeatmap } from '@/components/elevator/FloorHeatmap';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { ElevatorTelemetry } from '@elevateos/types';

export default function LiveElevatorPage({ params }: { params?: { id: string } }) {
  const router = useRouter();
  const elevatorId = params?.id || 'elv-a-01';
  const { events, addEvent } = useTelemetryStore();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState('7d');

  // Blackbox Flight Recorder Replay state
  const [isBlackboxMode, setIsBlackboxMode] = useState(false);
  const [blackboxOffsetSec, setBlackboxOffsetSec] = useState(0); // 0 = now, 60 = 60s ago
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [telemetryHistory, setTelemetryHistory] = useState<ElevatorTelemetry[]>([]);

  // Multi-angle CCTV camera state
  const [cameraAngle, setCameraAngle] = useState<'CABIN' | 'TRACTION_MOTOR' | 'PIT_BUFFER'>('CABIN');
  const [snapshotMessage, setSnapshotMessage] = useState<string | null>(null);
  const [isIntercomActive, setIsIntercomActive] = useState(false);

  // Simulated live car telemetry
  const [telemetry, setTelemetry] = useState<ElevatorTelemetry>({
    elevatorId,
    timestamp: '2026-11-18T05:30:00.000Z',
    floor: 4.0,
    targetFloor: null,
    direction: 'STATIONARY',
    velocityMps: 0,
    doorState: 'CLOSED',
    doorCycles: 14820,
    loadKg: 340,
    loadPercent: 34.0,
    isOverloaded: false,
    motorTempCelsius: 48.2,
    motorCurrentAmps: 1.2,
    vibrationRms: 0.045,
    controllerTempCelsius: 32.8,
    batteryVoltage: 27.2,
    safetyChainClosed: true,
    emergencyStopActive: false,
    gatewayConnected: true,
    lastUpdated: '2026-11-18T05:30:00.000Z',
  });

  useEffect(() => {
    setIsMounted(true);
    setTelemetry((prev) => ({
      ...prev,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Pre-seed 60 historical frames on component mount for instant blackbox scrubbing
  useEffect(() => {
    const historyFrames: ElevatorTelemetry[] = [];
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      const histTime = new Date(now - i * 1000).toISOString();
      const simulatedFloor = 1 + (Math.sin(i / 10) * 4 + 4);
      historyFrames.push({
        elevatorId,
        timestamp: histTime,
        floor: parseFloat(simulatedFloor.toFixed(2)),
        targetFloor: i > 25 ? 8 : null,
        direction: i > 25 ? 'UP' : 'STATIONARY',
        velocityMps: i > 25 ? 2.2 : 0,
        doorState: i <= 8 ? 'OPEN' : 'CLOSED',
        doorCycles: 14820 - Math.floor(i / 15),
        loadKg: 320 + Math.floor(Math.sin(i) * 60),
        loadPercent: 32.0,
        isOverloaded: false,
        motorTempCelsius: 47.5 + (i > 30 ? 2.5 : 0.7),
        motorCurrentAmps: i > 25 ? 14.2 : 1.1,
        vibrationRms: 0.042 + Math.abs(Math.sin(i)) * 0.008,
        controllerTempCelsius: 32.8,
        batteryVoltage: 27.2,
        safetyChainClosed: true,
        emergencyStopActive: false,
        gatewayConnected: true,
        lastUpdated: histTime,
      });
    }
    setTelemetryHistory(historyFrames);
  }, [elevatorId]);

  // Client-side live physics runner (clean, un-nested state update)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        if (prev.targetFloor === null || Math.abs(prev.floor - prev.targetFloor) < 0.05) {
          const isAtTarget = prev.targetFloor !== null;
          return {
            ...prev,
            direction: 'STATIONARY',
            velocityMps: 0,
            targetFloor: null,
            floor: isAtTarget ? prev.targetFloor! : prev.floor,
            doorState: isAtTarget ? 'OPEN' : 'CLOSED',
            timestamp: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
        }

        const isGoingUp = prev.targetFloor > prev.floor;
        const speed = 0.25;
        const nextFloor = isGoingUp ? prev.floor + speed : prev.floor - speed;

        return {
          ...prev,
          direction: isGoingUp ? 'UP' : 'DOWN',
          velocityMps: 2.5,
          floor: nextFloor,
          doorState: 'CLOSED',
          motorCurrentAmps: 14.8,
          timestamp: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Safely sync history buffer on telemetry update outside of the updater function
  useEffect(() => {
    if (isMounted) {
      setTelemetryHistory((hist) => [...hist.slice(-59), telemetry]);
    }
  }, [telemetry, isMounted]);

  // Blackbox Replay Playback timer
  useEffect(() => {
    if (!isBlackboxMode || !isPlayingReplay) return;

    const interval = setInterval(() => {
      setBlackboxOffsetSec((prev) => {
        if (prev <= 1) {
          setIsPlayingReplay(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000 / replaySpeed);

    return () => clearInterval(interval);
  }, [isBlackboxMode, isPlayingReplay, replaySpeed]);

  // Active telemetry to render: either historic frame or live telemetry
  const displayedTelemetry: ElevatorTelemetry = isBlackboxMode && telemetryHistory.length > 0
    ? (telemetryHistory[Math.max(0, Math.min(telemetryHistory.length - 1, (telemetryHistory.length - 1) - blackboxOffsetSec))] || telemetry)
    : telemetry;

  const handleDispatch = (target: number) => {
    if (isBlackboxMode) {
      alert('Physical motion commands are strictly disabled in Blackbox Forensic Replay Mode.');
      return;
    }

    setTelemetry((prev) => ({
      ...prev,
      targetFloor: target,
      direction: target > prev.floor ? 'UP' : 'DOWN',
      doorState: 'CLOSED',
    }));

    addEvent({
      elevatorId: telemetry.elevatorId,
      eventType: 'DISPATCH_CALL',
      description: `Target destination requested to Floor ${target}. Kinematic motion initiated.`,
      severity: 'INFO',
    });
  };

  const handleTriggerFault = (type: 'OVERHEAT' | 'SAFETY_CHAIN' | 'RESET') => {
    if (isBlackboxMode) {
      alert('Controller fault simulation is disabled in Blackbox Forensic Replay Mode.');
      return;
    }

    if (type === 'OVERHEAT') {
      setTelemetry((prev) => ({ ...prev, motorTempCelsius: 89.5 }));
      addEvent({
        elevatorId: telemetry.elevatorId,
        eventType: 'HIGH_MOTOR_TEMP',
        description: 'Traction motor thermistor exceeded 85°C safety limit.',
        severity: 'CRITICAL',
      });
    } else if (type === 'SAFETY_CHAIN') {
      setTelemetry((prev) => ({ ...prev, safetyChainClosed: false, velocityMps: 0, direction: 'STATIONARY' }));
      addEvent({
        elevatorId: telemetry.elevatorId,
        eventType: 'SAFETY_CHAIN_OPEN',
        description: 'Overspeed governor / pit switch interlock open. Motion safely inhibited.',
        severity: 'CRITICAL',
      });
    } else {
      setTelemetry((prev) => ({
        ...prev,
        safetyChainClosed: true,
        motorTempCelsius: 48.0,
        isOverloaded: false,
      }));
      addEvent({
        elevatorId: telemetry.elevatorId,
        eventType: 'FAULT_CLEARED',
        description: 'All safety interlocks and alarms restored to normal state.',
        severity: 'INFO',
      });
    }
  };

  const handleTakeSnapshot = () => {
    const snapId = `SNAP-${Date.now().toString(36).toUpperCase()}`;
    setSnapshotMessage(`Optical snapshot ${snapId} archived to forensic incident log.`);
    setTimeout(() => setSnapshotMessage(null), 3500);
  };

  const handleToggleIntercom = () => {
    setIsIntercomActive((prev) => !prev);
    addEvent({
      elevatorId: telemetry.elevatorId,
      eventType: isIntercomActive ? 'INTERCOM_TERMINATED' : 'INTERCOM_ESTABLISHED',
      description: isIntercomActive 
        ? 'EN 81-28 Emergency voice duplex session closed by workstation operator.' 
        : 'EN 81-28 Duplex audio intercom connection established with car interior.',
      severity: 'INFO',
    });
  };

  const tabs = [
    { id: 'trends', label: 'Telemetry Trends' },
    { id: 'timeline', label: 'Event Timeline' },
    { id: 'heatmap', label: 'Floor Heatmap' },
    { id: 'events', label: 'Live Event Stream', count: events.length },
    { id: 'commands', label: 'Command Verification Audit' },
    { id: 'capabilities', label: 'OEM Capabilities Matrix' },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Organisations', href: '/org/dashboard' },
        { label: 'Apex Financial Tower A', href: '/org/buildings' },
        { label: 'Elevator fleet', href: '/org/elevators' },
        { label: `Elevator ${displayedTelemetry.elevatorId.toUpperCase()}` },
      ]}
      title={`Elevator ${displayedTelemetry.elevatorId.toUpperCase()} (Apex Financial Tower A) Cockpit`}
      subtitle="Deterministic real-time telemetry stream via EMQX IoT Gateway & Optical Surveillance"
      actions={
        <div className="flex items-center space-x-2.5 flex-wrap gap-2">
          <DataFreshnessIndicator lastUpdated={displayedTelemetry.lastUpdated || displayedTelemetry.timestamp} />
          
          {/* Blackbox Mode Toggle Pill */}
          <button
            onClick={() => {
              const nextMode = !isBlackboxMode;
              setIsBlackboxMode(nextMode);
              if (nextMode) {
                setBlackboxOffsetSec(30);
                setIsPlayingReplay(false);
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold font-mono border transition-all ${
              isBlackboxMode 
                ? 'bg-[#C92D29] text-white border-[#C92D29] shadow-sm animate-pulse' 
                : 'bg-white text-[#433690] border-[#DCDFEA] hover:bg-[#EEF0F6]'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>{isBlackboxMode ? 'EXIT BLACKBOX' : 'BLACKBOX REPLAY'}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/elevators/comparison')}
          >
            Compare fleet
          </Button>

          <StatusBadge
            status={
              !displayedTelemetry.safetyChainClosed
                ? 'EMERGENCY'
                : displayedTelemetry.motorTempCelsius > 80
                ? 'FAULT'
                : displayedTelemetry.direction !== 'STATIONARY'
                ? 'RUNNING'
                : 'IDLE'
            }
          />
          <div className="flex items-center space-x-1.5 text-xs bg-white text-[#1E2232] border border-[#DCDFEA] px-3 py-1.5 rounded-[8px] font-mono shadow-xs">
            <Radio className="h-3.5 w-3.5 text-[#15804D] animate-pulse" />
            <span>GW-ELV-A-01: ONLINE</span>
          </div>
        </div>
      }
    >
      {/* BLACKBOX FLIGHT RECORDER SCRUB BAR (Appears when Blackbox is active or standby) */}
      {isBlackboxMode && (
        <div className="mb-6 bg-[#FFFBEB] border-2 border-[#F5A524] rounded-[10px] p-4 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-[6px] bg-[#C92D29] text-white">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold font-mono text-[#9C5C00] uppercase tracking-wider block">
                  Incident Forensics & Telemetry Blackbox
                </span>
                <span className="text-sm font-bold text-[#1E2232]">
                  Historical Kinematic Playback Buffer (T - {blackboxOffsetSec}s)
                </span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center space-x-2">
              {/* Rewind 5s */}
              <button
                onClick={() => setBlackboxOffsetSec((prev) => Math.min(59, prev + 5))}
                className="px-2.5 py-1.5 rounded-[6px] bg-white border border-[#DCDFEA] text-xs font-mono font-bold text-[#1E2232] hover:bg-[#EEF0F6] flex items-center space-x-1"
                title="Step back 5 seconds"
              >
                <Rewind className="h-3.5 w-3.5 text-[#5D6375]" />
                <span>-5s</span>
              </button>

              {/* Play / Pause */}
              <button
                onClick={() => {
                  if (blackboxOffsetSec === 0) setBlackboxOffsetSec(50);
                  setIsPlayingReplay(!isPlayingReplay);
                }}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#433690] text-white text-xs font-mono font-bold hover:bg-[#352A77] flex items-center space-x-1.5 shadow-sm"
              >
                {isPlayingReplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlayingReplay ? 'PAUSE' : 'PLAY'}</span>
              </button>

              {/* Fast Forward 5s */}
              <button
                onClick={() => setBlackboxOffsetSec((prev) => Math.max(0, prev - 5))}
                className="px-2.5 py-1.5 rounded-[6px] bg-white border border-[#DCDFEA] text-xs font-mono font-bold text-[#1E2232] hover:bg-[#EEF0F6] flex items-center space-x-1"
                title="Fast forward 5 seconds"
              >
                <span>+5s</span>
                <FastForward className="h-3.5 w-3.5 text-[#5D6375]" />
              </button>

              {/* Speed Multiplier */}
              <div className="flex rounded-[6px] border border-[#DCDFEA] overflow-hidden bg-white text-xs font-mono">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setReplaySpeed(spd)}
                    className={`px-2 py-1 transition-colors ${
                      replaySpeed === spd ? 'bg-[#433690] text-white font-bold' : 'text-[#5D6375] hover:bg-[#EEF0F6]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Exit Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsBlackboxMode(false);
                  setIsPlayingReplay(false);
                  setBlackboxOffsetSec(0);
                }}
              >
                Return to Live
              </Button>
            </div>
          </div>

          {/* Range Slider Scrubber */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono text-[#5D6375]">
              <span>-60s (T - 60)</span>
              <span className="font-bold text-[#433690]">
                Active Frame: {new Date(displayedTelemetry.timestamp).toLocaleTimeString()} (Offset: -{blackboxOffsetSec}s)
              </span>
              <span className="text-[#15804D] font-bold">LIVE (T - 0s)</span>
            </div>
            <input
              type="range"
              min="0"
              max="59"
              step="1"
              value={blackboxOffsetSec}
              onChange={(e) => {
                setBlackboxOffsetSec(parseInt(e.target.value, 10));
                setIsPlayingReplay(false);
              }}
              className="w-full h-2.5 bg-[#DCDFEA] rounded-lg appearance-none cursor-pointer accent-[#433690]"
            />
          </div>
        </div>
      )}

      {/* Snapshot Toast notification */}
      {snapshotMessage && (
        <div className="mb-4 p-3 bg-[#E6E3F7] border border-[#433690] rounded-[8px] text-[#433690] text-xs font-mono font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>{snapshotMessage}</span>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#433690]/30">ISO 27001 AUDITED</span>
        </div>
      )}

      {/* 2-Column Hero: Left is Shaft Visualizer & Simulator; Right is Telemetry Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-start">
        {/* LEFT COLUMN: Architectural Shaft Visualizer + Simulator + Multi-Angle CCTV Stream */}
        <div className="lg:col-span-5 space-y-4">
          <ElevatorShaftVisualizer
            telemetry={displayedTelemetry}
            minFloor={-2}
            maxFloor={14}
            onFloorCall={handleDispatch}
          />

          {/* Integrated Simulation Bar */}
          <div className="p-3.5 bg-white rounded-[8px] border border-[#DCDFEA] shadow-card space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-[#1E2232] flex items-center space-x-1.5">
                <Activity className="h-3.5 w-3.5 text-[#433690]" />
                <span>Call Floor:</span>
              </span>
              <div className="flex space-x-1 flex-wrap gap-1">
                {[1, 4, 7, 10, 14].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => handleDispatch(fl)}
                    disabled={isBlackboxMode}
                    className="px-2.5 py-1 rounded-[6px] bg-[#EEF0F6] hover:bg-[#E6E3F7] hover:text-[#433690] disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold text-[#1E2232] transition-colors border border-[#DCDFEA]"
                    title={`Send car to Floor ${fl}`}
                  >
                    F{fl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCDFEA] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#5D6375] font-medium text-[11px]">Physics Fault Simulation:</span>
              <div className="flex items-center space-x-1.5 flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBlackboxMode}
                  onClick={() => handleTriggerFault('OVERHEAT')}
                >
                  Overheat
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={isBlackboxMode}
                  onClick={() => handleTriggerFault('SAFETY_CHAIN')}
                >
                  Break Chain
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  disabled={isBlackboxMode}
                  onClick={() => handleTriggerFault('RESET')}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* MULTI-ANGLE CCTV OPTICAL SURVEILLANCE CARD */}
          <div className="bg-white rounded-[8px] border border-[#DCDFEA] shadow-card overflow-hidden">
            <div className="p-3 border-b border-[#DCDFEA] flex items-center justify-between bg-[#EEF0F6]/50">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-[#433690]" />
                <span className="text-xs font-bold font-mono text-[#1E2232] uppercase">
                  Optical Surveillance Stream (EN 81-28)
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-[#C92D29] animate-ping"></span>
                <span className="text-[10px] font-mono font-bold text-[#C92D29]">● REC</span>
              </div>
            </div>

            {/* Camera Angle Tabs */}
            <div className="grid grid-cols-3 bg-[#EEF0F6] border-b border-[#DCDFEA] text-[11px] font-mono">
              <button
                onClick={() => setCameraAngle('CABIN')}
                className={`py-2 px-2 text-center transition-colors font-semibold border-r border-[#DCDFEA] ${
                  cameraAngle === 'CABIN' ? 'bg-white text-[#433690] border-b-2 border-b-[#433690]' : 'text-[#5D6375] hover:text-[#1E2232]'
                }`}
              >
                CAM 01: Cabin
              </button>
              <button
                onClick={() => setCameraAngle('TRACTION_MOTOR')}
                className={`py-2 px-2 text-center transition-colors font-semibold border-r border-[#DCDFEA] ${
                  cameraAngle === 'TRACTION_MOTOR' ? 'bg-white text-[#433690] border-b-2 border-b-[#433690]' : 'text-[#5D6375] hover:text-[#1E2232]'
                }`}
              >
                CAM 02: Hoistway
              </button>
              <button
                onClick={() => setCameraAngle('PIT_BUFFER')}
                className={`py-2 px-2 text-center transition-colors font-semibold ${
                  cameraAngle === 'PIT_BUFFER' ? 'bg-white text-[#433690] border-b-2 border-b-[#433690]' : 'text-[#5D6375] hover:text-[#1E2232]'
                }`}
              >
                CAM 03: Pit Buffer
              </button>
            </div>

            {/* Simulated Industrial Video Monitor Stage */}
            <div className="relative bg-[#0F172A] p-4 text-white font-mono text-xs select-none min-h-[220px] flex flex-col justify-between">
              {/* Scanline pattern overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

              {/* Monitor OSD Header */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-emerald-400">
                <span className="tracking-wider">
                  {cameraAngle === 'CABIN' && 'CH-01 // CABIN DOME 4K (IS 17900)'}
                  {cameraAngle === 'TRACTION_MOTOR' && 'CH-02 // TRACTION SHEAVE & BRAKE'}
                  {cameraAngle === 'PIT_BUFFER' && 'CH-03 // SHAFT PIT & LIMIT SWITCH'}
                </span>
                <span>
                  {new Date(displayedTelemetry.timestamp).toISOString().replace('T', ' ').slice(0, 19)} UTC
                </span>
              </div>

              {/* Dynamic Camera Perspective Content */}
              <div className="relative z-10 my-4 flex flex-col items-center justify-center">
                {cameraAngle === 'CABIN' && (
                  <div className="w-full max-w-xs space-y-2 border border-emerald-500/30 rounded p-3 bg-emerald-950/20">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Occupancy:</span>
                      <span className="font-bold text-emerald-400">{displayedTelemetry.loadKg > 50 ? '2 Passengers' : 'Vacant'}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Door Aperture:</span>
                      <span className="font-bold uppercase text-amber-400">{displayedTelemetry.doorState}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Intercom State:</span>
                      <span className={`font-bold ${isIntercomActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
                        {isIntercomActive ? 'DUPLEX OPEN' : 'STANDBY'}
                      </span>
                    </div>
                    {/* Bounding box visual simulation */}
                    <div className="h-12 border border-dashed border-emerald-500/50 rounded flex items-center justify-center text-[10px] text-emerald-400">
                      [AI CV TRACKING: INTERIOR SAFE / NO OBSTRUCTION]
                    </div>
                  </div>
                )}

                {cameraAngle === 'TRACTION_MOTOR' && (
                  <div className="w-full max-w-xs space-y-2 border border-blue-500/30 rounded p-3 bg-blue-950/20">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Sheave Motion:</span>
                      <span className="font-bold text-blue-400">
                        {displayedTelemetry.direction === 'STATIONARY' ? 'HOLDING' : `ROTATING (${displayedTelemetry.velocityMps} m/s)`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Brake Caliper:</span>
                      <span className="font-bold text-emerald-400">
                        {displayedTelemetry.velocityMps > 0 ? 'ENERGIZED / RELEASED' : 'SPRING-APPLIED / SECURE'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Thermal IR:</span>
                      <span className="font-bold text-amber-400">{displayedTelemetry.motorTempCelsius}°C</span>
                    </div>
                  </div>
                )}

                {cameraAngle === 'PIT_BUFFER' && (
                  <div className="w-full max-w-xs space-y-2 border border-amber-500/30 rounded p-3 bg-amber-950/20">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Hydraulic Buffer:</span>
                      <span className="font-bold text-emerald-400">STROKE 100% (READY)</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Governor Tension:</span>
                      <span className="font-bold text-emerald-400">4.8 kN NOMINAL</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Sump Water Sensor:</span>
                      <span className="font-bold text-emerald-400">DRY / INTERLOCKED</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Monitor OSD Footer & Stream Actions */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px]">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span>H.265 / RTSP</span>
                  <span>•</span>
                  <span>1080P 30FPS</span>
                  <span>•</span>
                  <span className="text-emerald-400">42ms LAT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTakeSnapshot}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 border border-slate-600 flex items-center space-x-1"
                    title="Capture evidentiary optical snapshot"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Snap</span>
                  </button>
                  <button
                    onClick={handleToggleIntercom}
                    className={`px-2 py-1 rounded border flex items-center space-x-1 ${
                      isIntercomActive 
                        ? 'bg-[#C92D29] border-[#C92D29] text-white animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                    }`}
                    title="Two-way duplex voice link with cabin"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>{isIntercomActive ? 'Mute' : 'Audio'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 2x2 Telemetry & Diagnostics Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Position, Motion & Doors */}
          <Card title="Kinematics & Door State">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#EEF0F6] border border-[#DCDFEA]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#5D6375] block">Current Position</span>
                  <div className="text-3xl font-bold font-mono text-[#1E2232]">
                    Floor {Math.round(displayedTelemetry.floor)}
                  </div>
                  <span className="text-[11px] text-[#5D6375] font-mono">
                    Continuous: {displayedTelemetry.floor.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-2.5 rounded-[6px] bg-[#433690] text-white min-w-[70px]">
                  {displayedTelemetry.direction === 'UP' && <ArrowUp className="h-5 w-5 text-[#15804D] animate-bounce" />}
                  {displayedTelemetry.direction === 'DOWN' && <ArrowDown className="h-5 w-5 text-[#15804D] animate-bounce" />}
                  {displayedTelemetry.direction === 'STATIONARY' && <Minus className="h-5 w-5 text-slate-400" />}
                  <span className="text-[10px] font-mono font-bold mt-0.5 tracking-wider text-[#F5A524]">
                    {displayedTelemetry.direction}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-[#DCDFEA] pt-1">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Target Floor:</span>
                  <span className="font-bold font-mono text-[#1E2232]">
                    {displayedTelemetry.targetFloor !== null ? `Floor ${displayedTelemetry.targetFloor}` : 'Idle / Standby'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Car Speed:</span>
                  <span className="font-bold font-mono text-[#1E2232]">
                    {displayedTelemetry.velocityMps.toFixed(2)} m/s
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Door State:</span>
                  <span className="font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#EEF0F6] text-[#1E2232] border border-[#DCDFEA]">
                    {displayedTelemetry.doorState}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Door Zone Interlock:</span>
                  <span className="font-mono text-[#15804D] font-bold flex items-center space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>ENGAGED</span>
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Door Cycles:</span>
                  <span className="font-mono font-bold text-[#1E2232]">
                    {displayedTelemetry.doorCycles.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Electrical, Cabin Load & Vibration */}
          <Card title="Electrical & Mechanical">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5D6375]">Cabin Load ({displayedTelemetry.loadKg} kg):</span>
                  <span className="font-mono font-bold text-[#1E2232]">{displayedTelemetry.loadPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EEF0F6] rounded-full overflow-hidden border border-[#DCDFEA]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      displayedTelemetry.loadPercent > 90 ? 'bg-[#C92D29]' : 'bg-[#433690]'
                    }`}
                    style={{ width: `${displayedTelemetry.loadPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-[#DCDFEA] pt-1">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Motor Current:</span>
                  <span className="font-mono font-bold text-[#1E2232]">
                    {displayedTelemetry.motorCurrentAmps.toFixed(1)} A
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Vibration RMS:</span>
                  <span className="font-mono font-bold text-[#1E2232]">
                    {displayedTelemetry.vibrationRms.toFixed(3)} m/s²
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Controller Temperature:</span>
                  <span className="font-mono font-bold text-[#1E2232]">
                    {displayedTelemetry.controllerTempCelsius}°C
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Backup Battery:</span>
                  <span className="font-mono font-bold text-[#15804D] flex items-center space-x-1">
                    <Battery className="h-3.5 w-3.5" />
                    <span>{displayedTelemetry.batteryVoltage} V</span>
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Gateway Status:</span>
                  <span className="font-mono text-[11px] text-[#15804D] font-bold">
                    ONLINE (TLS 1.3)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Safety Chain & Circuits */}
          <Card title="Safety Chain & Operating Mode">
            <div className="space-y-3">
              <div className="p-3 rounded-[6px] bg-[#EEF0F6] border border-[#DCDFEA] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#5D6375] block">Safety Chain Status</span>
                  <span
                    className={`text-sm font-mono font-bold flex items-center space-x-1 mt-0.5 ${
                      displayedTelemetry.safetyChainClosed ? 'text-[#15804D]' : 'text-[#C92D29] animate-pulse'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{displayedTelemetry.safetyChainClosed ? 'CLOSED / NORMAL' : 'CIRCUIT OPEN'}</span>
                  </span>
                </div>
                <StatusBadge
                  status={displayedTelemetry.safetyChainClosed ? 'HEALTHY' : 'CRITICAL'}
                  size="sm"
                />
              </div>

              <div className="space-y-2 text-xs divide-y divide-[#DCDFEA] pt-1">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Operating Mode:</span>
                  <span className="font-mono font-bold text-[#1E2232]">Normal Automatic</span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Emergency Stop:</span>
                  <span className="font-mono text-[#15804D] font-bold">Inactive</span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Overspeed Governor:</span>
                  <span className="font-mono text-[#15804D] font-bold">Armed / Locked</span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[#5D6375]">Fire Service Mode:</span>
                  <span className="font-mono text-[#5D6375] font-bold">Phase 1 Standby</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4: Equipment Thermal Health & Fleet KPIs */}
          <Card title="Thermal Health & Reliability">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5D6375]">Motor Temperature:</span>
                  <span
                    className={`font-mono font-bold ${
                      displayedTelemetry.motorTempCelsius > 75 ? 'text-[#C92D29]' : 'text-[#1E2232]'
                    }`}
                  >
                    {displayedTelemetry.motorTempCelsius.toFixed(1)}°C
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#EEF0F6] rounded-full overflow-hidden border border-[#DCDFEA]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      displayedTelemetry.motorTempCelsius > 75 ? 'bg-[#C92D29]' : 'bg-[#15804D]'
                    }`}
                    style={{ width: `${Math.min(100, (displayedTelemetry.motorTempCelsius / 90) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Health Score Trigger Card */}
              <div
                onClick={() => setIsHealthModalOpen(true)}
                className="cursor-pointer bg-[#EEF0F6] hover:bg-[#E6E3F7] p-2.5 rounded-[6px] border border-[#DCDFEA] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-[#5D6375] uppercase font-semibold">Health Score</div>
                  <div className="text-xl font-bold font-mono text-[#15804D] mt-0.5">
                    92 <span className="text-xs text-[#5D6375] font-normal">/ 100</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#433690] font-semibold underline">
                  Explain score →
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-[#EEF0F6] p-2 rounded-[6px] border border-[#DCDFEA]">
                  <div className="text-[10px] text-[#5D6375]">30d Availability</div>
                  <div className="text-sm font-bold text-[#1E2232] font-mono mt-0.5">99.85%</div>
                </div>
                <div className="bg-[#EEF0F6] p-2 rounded-[6px] border border-[#DCDFEA]">
                  <div className="text-[10px] text-[#5D6375]">Trips Today</div>
                  <div className="text-sm font-bold text-[#1E2232] font-mono mt-0.5">384</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM PANEL TABS: All 6 Deep Diagnostics Maintained */}
      <Card noPadding>
        <div className="px-5 pt-3 border-b border-[#DCDFEA]">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-5">
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <DateRangeSelector
                  onChange={(range) => setDateRangePreset(range.preset || '7d')}
                />
              </div>
              <ElevatorTrendCharts elevatorId={displayedTelemetry.elevatorId} dateRangePreset={dateRangePreset} />
            </div>
          )}

          {activeTab === 'timeline' && (
            <ElevatorEventTimeline elevatorId={displayedTelemetry.elevatorId} />
          )}

          {activeTab === 'heatmap' && (
            <FloorHeatmap elevatorId={displayedTelemetry.elevatorId} />
          )}

          {activeTab === 'events' && (
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#EEF0F6]/50 border border-[#DCDFEA]"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-[#C92D29]'
                          : evt.severity === 'WARNING'
                          ? 'bg-[#9C5C00]'
                          : 'bg-[#433690]'
                      }`}
                    ></span>
                    <span className="font-bold text-[#1E2232]">{evt.eventType}</span>
                    <span className="text-[#5D6375]">{evt.description}</span>
                  </div>
                  <span className="text-[10px] text-[#5D6375]">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="text-xs text-[#5D6375] space-y-3">
              <div className="p-3 bg-[#E6E3F7] border border-[#433690]/30 rounded-[6px] text-[#433690]">
                <span className="font-bold">12-State Verified Command Engine:</span> Remote dispatch commands undergo strict RBAC validation, BullMQ idempotency queuing, OEM controller transmission, controller acknowledgement, and physical-state verification through telemetry.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-[#DCDFEA] text-[#5D6375] text-[10px]">
                      <th className="py-2 px-3">COMMAND ID</th>
                      <th className="py-2 px-3">TYPE</th>
                      <th className="py-2 px-3">STATUS</th>
                      <th className="py-2 px-3">CONTROLLER ACK</th>
                      <th className="py-2 px-3">VERIFICATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#DCDFEA]">
                      <td className="py-2.5 px-3 text-[#433690] font-bold">cmd-881b-29a</td>
                      <td className="py-2.5 px-3">DISPATCH_CALL</td>
                      <td className="py-2.5 px-3"><span className="text-[#15804D] font-bold">COMPLETED</span></td>
                      <td className="py-2.5 px-3">YES (120ms)</td>
                      <td className="py-2.5 px-3">VERIFIED (Arrival Floor 8)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'capabilities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#EEF0F6]/60 border border-[#DCDFEA] rounded-[6px]">
                <span className="text-[#5D6375] block text-[10px]">Landing Call</span>
                <span className="font-bold text-[#15804D]">SUPPORTED</span>
              </div>
              <div className="p-3 bg-[#EEF0F6]/60 border border-[#DCDFEA] rounded-[6px]">
                <span className="text-[#5D6375] block text-[10px]">Destination Dispatch</span>
                <span className="font-bold text-[#15804D]">SUPPORTED</span>
              </div>
              <div className="p-3 bg-[#EEF0F6]/60 border border-[#DCDFEA] rounded-[6px]">
                <span className="text-[#5D6375] block text-[10px]">Door Hold Control</span>
                <span className="font-bold text-[#15804D]">SUPPORTED</span>
              </div>
              <div className="p-3 bg-[#EEF0F6]/60 border border-[#DCDFEA] rounded-[6px]">
                <span className="text-[#5D6375] block text-[10px]">Motor Telemetry</span>
                <span className="font-bold text-[#15804D]">SUPPORTED</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Health Score Deduction Breakdown Modal */}
      <HealthScoreBreakdownModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        elevatorId={displayedTelemetry.elevatorId}
        currentScore={92}
      />
    </DashboardLayout>
  );
}
