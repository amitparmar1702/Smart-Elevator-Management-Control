'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { THRESHOLDS } from '@/config/thresholds';
import { TrendService } from '@/services/trendService';
import { TrendDataPoint } from '@/mocks/trendMock';

interface ElevatorTrendChartsProps {
  elevatorId: string;
  dateRangePreset?: string;
}

export const ElevatorTrendCharts: React.FC<ElevatorTrendChartsProps> = ({
  elevatorId,
  dateRangePreset = '7d',
}) => {
  const [motorCurrentData, setMotorCurrentData] = useState<TrendDataPoint[]>([]);
  const [tempData, setTempData] = useState<TrendDataPoint[]>([]);
  const [doorCyclesData, setDoorCyclesData] = useState<TrendDataPoint[]>([]);
  const [healthScoreData, setHealthScoreData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTrends() {
      setIsLoading(true);
      const [mc, temp, dc, hs] = await Promise.all([
        TrendService.getMotorCurrent(elevatorId, dateRangePreset),
        TrendService.getControllerTemperature(elevatorId, dateRangePreset),
        TrendService.getDoorCycles(elevatorId, dateRangePreset),
        TrendService.getHealthScore(elevatorId, dateRangePreset),
      ]);
      if (isMounted) {
        setMotorCurrentData(mc);
        setTempData(temp);
        setDoorCyclesData(dc);
        setHealthScoreData(hs);
        setIsLoading(false);
      }
    }
    loadTrends();
    return () => {
      isMounted = false;
    };
  }, [elevatorId, dateRangePreset]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Motor Current Chart */}
      <Card title="Motor current trend">
        <div className="text-[11px] text-[#5D6375] -mt-2 mb-2">
          Normal limit: {THRESHOLDS.motorCurrent.normalMax} A | Warning: {THRESHOLDS.motorCurrent.warningMax} A
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={motorCurrentData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCDFEA" />
              <XAxis dataKey="timeLabel" stroke="#5D6375" fontSize={10} />
              <YAxis stroke="#5D6375" fontSize={10} unit=" A" domain={[20, 45]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', color: '#1E2232', borderRadius: '6px', fontSize: '11px', border: '1px solid #DCDFEA', boxShadow: '0 1px 3px rgba(30,34,50,0.06)' }}
                formatter={(val: number) => [`${val} A`, 'Current']}
              />
              <ReferenceLine
                y={THRESHOLDS.motorCurrent.normalMax}
                stroke="#9C5C00"
                strokeDasharray="4 4"
                label={{ value: 'Warn', position: 'insideTopRight', fill: '#9C5C00', fontSize: 9 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#433690"
                strokeWidth={2}
                dot={{ r: 3, fill: '#433690' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Controller Temperature Chart */}
      <Card title="Controller temperature trend">
        <div className="text-[11px] text-[#5D6375] -mt-2 mb-2">
          Normal limit: {THRESHOLDS.controllerTemperature.normalMax} °C | Warning: {THRESHOLDS.controllerTemperature.warningMax} °C
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCDFEA" />
              <XAxis dataKey="timeLabel" stroke="#5D6375" fontSize={10} />
              <YAxis stroke="#5D6375" fontSize={10} unit=" °C" domain={[30, 50]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', color: '#1E2232', borderRadius: '6px', fontSize: '11px', border: '1px solid #DCDFEA', boxShadow: '0 1px 3px rgba(30,34,50,0.06)' }}
                formatter={(val: number) => [`${val} °C`, 'Temperature']}
              />
              <ReferenceLine
                y={THRESHOLDS.controllerTemperature.normalMax}
                stroke="#9C5C00"
                strokeDasharray="4 4"
                label={{ value: 'Warn', position: 'insideTopRight', fill: '#9C5C00', fontSize: 9 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F5A524"
                strokeWidth={2}
                dot={{ r: 3, fill: '#F5A524' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Door Cycles per Day Chart */}
      <Card title="Door cycles per day">
        <div className="text-[11px] text-[#5D6375] -mt-2 mb-2">
          Daily wear indicator (nominal: 400 - 650 cycles/day)
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={doorCyclesData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCDFEA" />
              <XAxis dataKey="timeLabel" stroke="#5D6375" fontSize={10} />
              <YAxis stroke="#5D6375" fontSize={10} domain={[200, 700]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', color: '#1E2232', borderRadius: '6px', fontSize: '11px', border: '1px solid #DCDFEA', boxShadow: '0 1px 3px rgba(30,34,50,0.06)' }}
                formatter={(val: number) => [`${val} cycles`, 'Door cycles']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#15804D"
                strokeWidth={2}
                dot={{ r: 3, fill: '#15804D' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Health Score Trend Chart */}
      <Card title="Health score trend">
        <div className="text-[11px] text-[#5D6375] -mt-2 mb-2">
          Baseline target: &gt; 90 / 100 points
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthScoreData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCDFEA" />
              <XAxis dataKey="timeLabel" stroke="#5D6375" fontSize={10} />
              <YAxis stroke="#5D6375" fontSize={10} domain={[80, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', color: '#1E2232', borderRadius: '6px', fontSize: '11px', border: '1px solid #DCDFEA', boxShadow: '0 1px 3px rgba(30,34,50,0.06)' }}
                formatter={(val: number) => [`${val} / 100`, 'Health score']}
              />
              <ReferenceLine
                y={90}
                stroke="#15804D"
                strokeDasharray="4 4"
                label={{ value: 'Target 90', position: 'insideTopRight', fill: '#15804D', fontSize: 9 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#5543C0"
                strokeWidth={2}
                dot={{ r: 3, fill: '#5543C0' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
