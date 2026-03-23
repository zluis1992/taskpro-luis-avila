'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskItem } from '@/app/core/models/task.model';
import { Project } from '@/app/core/models/project.model';
import { taskService } from '@/app/core/services/task.service';
import { projectService } from '@/app/core/services/project.service';

export type DashboardStats = {
  totalProjects: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
};

export type ProjectTaskCount = {
  projectName: string;
  count: number;
};

export function useDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [taskList, projList] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
      ]);
      setTasks(taskList);
      setProjects(projList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const stats: DashboardStats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === 'Pending').length,
    inProgressTasks: tasks.filter((t) => t.status === 'InProgress').length,
    completedTasks: tasks.filter((t) => t.status === 'Completed').length,
    cancelledTasks: tasks.filter((t) => t.status === 'Cancelled').length,
  };

  const tasksByStatus = [
    { status: 'Pendientes', count: stats.pendingTasks, color: '#d97706' },
    { status: 'En progreso', count: stats.inProgressTasks, color: '#3399ff' },
    { status: 'Completadas', count: stats.completedTasks, color: '#28a745' },
    { status: 'Canceladas', count: stats.cancelledTasks, color: '#dc3545' },
  ];

  const tasksByProject: ProjectTaskCount[] = projects.map((p) => ({
    projectName: p.name,
    count: tasks.filter((t) => t.projectId === p.id).length,
  })).filter((p) => p.count > 0);

  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === 'Completed' || t.status === 'Cancelled') return false;
      const due = new Date(t.dueDate);
      const now = new Date();
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= -1 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  function goToTasks() {
    router.push('/tasks');
  }

  return {
    tasks,
    projects,
    loading,
    stats,
    tasksByStatus,
    tasksByProject,
    upcomingTasks,
    projectMap,
    goToTasks,
  };
}
