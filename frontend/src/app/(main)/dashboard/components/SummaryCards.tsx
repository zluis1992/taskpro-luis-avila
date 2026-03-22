'use client';

import type { DashboardStats } from '../hooks/useDashboard';

type Props = { stats: DashboardStats; onTasksClick: () => void };

const tiles = [
  { key: 'totalProjects' as const,   label: 'Proyectos',   icon: '📂', color: '#6366f1', bg: '#eef2ff' },
  { key: 'pendingTasks' as const,    label: 'Pendientes',  icon: '⏳', color: '#d97706', bg: '#fffbeb' },
  { key: 'inProgressTasks' as const, label: 'En progreso', icon: '🔄', color: '#3399ff', bg: '#eff6ff' },
  { key: 'completedTasks' as const,  label: 'Completadas', icon: '✅', color: '#28a745', bg: '#f0fdf4' },
];

export function SummaryCards({ stats, onTasksClick }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
      {tiles.map((item) => (
        <div
          key={item.key}
          onClick={item.key !== 'totalProjects' ? onTasksClick : undefined}
          style={{
            background: item.bg,
            borderRadius: 10,
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: item.key !== 'totalProjects' ? 'pointer' : 'default',
            border: `1px solid ${item.color}22`,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: item.color }}>{stats[item.key]}</div>
          </div>
          <div style={{ fontSize: 28 }}>{item.icon}</div>
        </div>
      ))}
    </div>
  );
}
