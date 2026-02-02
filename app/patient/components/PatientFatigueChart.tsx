'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FatigueDataPoint {
  date: string;
  fatigueLevel: number;
  notes?: string;
  exerciseCount?: number;
}

interface PatientFatigueChartProps {
  data: FatigueDataPoint[];
  className?: string;
}

export default function PatientFatigueChart({ data, className = '' }: PatientFatigueChartProps) {
  // Prepare chart data
  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Fatigue Level',
        data: data.map(point => point.fatigueLevel),
        borderColor: 'rgb(239, 68, 68)', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Your Fatigue Trends',
        color: '#ffffff',
        font: {
          size: 16,
        },
      },
      legend: {
        labels: {
          color: '#9ca3af',
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Fatigue Level (1-10)',
          color: '#9ca3af',
        },
        min: 1,
        max: 10,
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
        },
        grid: {
          color: '#374151',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
    },
  };

  // Calculate metrics
  const avgFatigue = data.length > 0 
    ? data.reduce((sum, point) => sum + point.fatigueLevel, 0) / data.length 
    : 0;
  
  const trend = data.length > 1 
    ? data[data.length - 1].fatigueLevel - data[0].fatigueLevel 
    : 0;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Fatigue Tracking</h3>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {avgFatigue.toFixed(1)}
            </div>
            <div className="text-sm text-gray-300">Average Level</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${trend >= 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}
            </div>
            <div className="text-sm text-gray-300">Recent Trend</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {data.length}
            </div>
            <div className="text-sm text-gray-300">Days Tracked</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* Recent Entries */}
      {data.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Recent Entries</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {data.slice(-5).reverse().map((point, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">
                      {new Date(point.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {point.notes && (
                      <div className="text-sm text-gray-400 mt-1">
                        {point.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-lg font-bold text-red-400">
                      {point.fatigueLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No fatigue data yet</div>
          <div className="text-sm">Start tracking your energy levels to see trends</div>
        </div>
      )}
    </div>
  );
}