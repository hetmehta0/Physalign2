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
  rep: number;
  stressLevel: number;
  quality: number;
  timestamp: number;
}

interface FatigueChartProps {
  data: FatigueDataPoint[];
  className?: string;
}

export default function FatigueChart({ data, className = '' }: FatigueChartProps) {
  // Prepare chart data
  const chartData = {
    labels: data.map(point => `Rep ${point.rep}`),
    datasets: [
      {
        label: 'Stress Level',
        data: data.map(point => point.stressLevel),
        borderColor: 'rgb(239, 68, 68)', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Form Quality',
        data: data.map(point => point.quality),
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Performance Over Time',
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
          text: 'Stress Level (%)',
          color: '#9ca3af',
        },
        min: 0,
        max: 100,
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Form Quality (%)',
          color: '#9ca3af',
        },
        min: 0,
        max: 100,
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          drawOnChartArea: false,
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
  const avgStress = data.length > 0 
    ? data.reduce((sum, point) => sum + point.stressLevel, 0) / data.length 
    : 0;
  
  const avgQuality = data.length > 0 
    ? data.reduce((sum, point) => sum + point.quality, 0) / data.length 
    : 0;

  const fatigueTrend = data.length > 1 
    ? data[data.length - 1].stressLevel - data[0].stressLevel 
    : 0;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Performance Analytics</h3>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {avgStress.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Avg Stress</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {avgQuality.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Avg Quality</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${fatigueTrend >= 0 ? 'text-yellow-400' : 'text-blue-400'}`}>
              {fatigueTrend >= 0 ? '↗' : '↘'} {Math.abs(fatigueTrend).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Fatigue Trend</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      {/* Data Table */}
      {data.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Detailed Rep Data</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Rep</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Stress Level</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Quality</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.map((point, index) => (
                  <tr key={index} className="border-t border-gray-600">
                    <td className="px-4 py-2 text-sm text-white">#{point.rep}</td>
                    <td className="px-4 py-2 text-sm text-red-400">{point.stressLevel.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-sm text-green-400">{point.quality.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-sm text-gray-400">
                      {new Date(point.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}