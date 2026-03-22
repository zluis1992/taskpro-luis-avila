'use client';

import { TaskItem } from '@/app/core/models/task.model';
import { Badge } from '@/app/shared/components/Badge';

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: '#d97706',
  InProgress: '#3399ff',
};

type Props = {
  tasks: TaskItem[];
  projectMap: Map<number, string>;
};

export function UpcomingTasks({ tasks, projectMap }: Props) {
  if (tasks.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', color: '#999', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No hay tareas próximas a vencer
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 16 }}>
        Próximas a vencer
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map((t) => {
          const daysLeft = Math.ceil((new Date(t.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysLeft < 0;
          const isToday = daysLeft === 0;

          return (
            <div key={t.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 8,
              background: isOverdue ? '#fef2f2' : isToday ? '#fffbeb' : '#f8fafc',
              border: `1px solid ${isOverdue ? '#fecaca' : isToday ? '#fde68a' : '#e2e8f0'}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {projectMap.get(t.projectId) ?? 'Sin proyecto'} {t.assignedUserName ? `· ${t.assignedUserName}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge label={STATUS_LABELS[t.status] ?? t.status} color={STATUS_COLORS[t.status] ?? '#64748b'} />
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isOverdue ? '#dc2626' : isToday ? '#d97706' : '#64748b',
                  whiteSpace: 'nowrap',
                }}>
                  {isOverdue ? `${Math.abs(daysLeft)}d atrasada` : isToday ? 'Hoy' : `${daysLeft}d`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
