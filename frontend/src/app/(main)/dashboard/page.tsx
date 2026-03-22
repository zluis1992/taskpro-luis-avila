'use client';

import { useDashboard } from './hooks/useDashboard';
import { SummaryCards } from './components/SummaryCards';
import { TaskPieChart } from './components/TaskPieChart';
import { TasksByProject } from './components/TasksByProject';
import { UpcomingTasks } from './components/UpcomingTasks';

export default function DashboardPage() {
  const d = useDashboard();

  return (
    <div>
      <h2 className="tp-page-title">Dashboard</h2>
      <p className="tp-page-subtitle">Resumen general de tu actividad</p>

      <SummaryCards stats={d.stats} onTasksClick={d.goToTasks} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 20 }}>
        <TaskPieChart data={d.tasksByStatus} />
        <TasksByProject data={d.tasksByProject} />
      </div>

      <div style={{ marginTop: 20 }}>
        <UpcomingTasks tasks={d.upcomingTasks} projectMap={d.projectMap} />
      </div>
    </div>
  );
}
