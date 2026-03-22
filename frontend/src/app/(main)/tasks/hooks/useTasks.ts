'use client';

import { useCallback, useEffect, useState } from 'react';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { TaskItem } from '@/app/core/models/task.model';
import { User } from '@/app/core/models/user.model';
import { Project } from '@/app/core/models/project.model';
import { taskService } from '@/app/core/services/task.service';
import { projectService } from '@/app/core/services/project.service';
import { userService } from '@/app/core/services/user.service';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from '../constants';
import { TaskFormData, emptyTaskForm } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailPopupVisible, setDetailPopupVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<TaskItem | null>(null);

  const [formPopupVisible, setFormPopupVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [form, setForm] = useState<TaskFormData>(emptyTaskForm());
  const [saving, setSaving] = useState(false);

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projList, userList] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
      ]);
      setProjects(projList);
      setUsers(userList);
      const taskLists = await Promise.all(
        projList.map((p) => taskService.getByProject(p.id).catch(() => [])),
      );
      setTasks(taskLists.flat());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function showDetail(data: TaskItem) {
    setSelectedDetail(data);
    setDetailPopupVisible(true);
  }

  function openNewTask() {
    setDetailPopupVisible(false);
    setEditingTask(null);
    setForm(emptyTaskForm());
    setFormPopupVisible(true);
  }

  function openEditTask(task: TaskItem) {
    setDetailPopupVisible(false);
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      priority: PRIORITY_OPTIONS.find((p) => p.label === PRIORITY_LABELS[task.priority])?.value ?? 1,
      status: STATUS_OPTIONS.find((s) => s.label === STATUS_LABELS[task.status])?.value ?? 0,
      dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : null,
      assignedUserId: task.assignedUserId ?? null,
      projectId: task.projectId,
    });
    setFormPopupVisible(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.projectId) return;
    setSaving(true);
    try {
      if (editingTask) {
        await taskService.update(editingTask.projectId, editingTask.id, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate,
          assignedUserId: form.assignedUserId,
        });
      } else {
        await taskService.create(form.projectId, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate,
          assignedUserId: form.assignedUserId,
        });
      }
      setFormPopupVisible(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task: TaskItem) {
    const result = await dxConfirm(
      `¿Está seguro de que desea eliminar la tarea "<b>${task.title}</b>"?`,
      'Confirmar eliminación',
    );
    if (!result) return;
    await taskService.remove(task.projectId, task.id);
    await loadData();
  }

  return {
    tasks,
    projects,
    users,
    loading,
    saving,
    projectMap,
    projectOptions,
    userOptions,
    detailPopupVisible,
    selectedDetail,
    formPopupVisible,
    editingTask,
    form,
    setForm,
    setDetailPopupVisible,
    setFormPopupVisible,
    showDetail,
    openNewTask,
    openEditTask,
    handleSave,
    handleDelete,
  };
}
