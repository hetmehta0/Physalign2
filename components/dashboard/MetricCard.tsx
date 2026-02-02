import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string;
}

export default function MetricCard({ label, value, icon, colorClass = 'text-teal-600' }: MetricCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="icon-sm" style={{ color: '#94a3b8' }}>
          {icon}
        </div>
      </div>
      <div className={`stat-card-value ${colorClass}`}>
        {value}
      </div>
    </div>
  );
}