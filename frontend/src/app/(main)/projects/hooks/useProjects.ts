'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { Project } from '@/app/core/models/project.model';
import { projectService } from '@/app/core/services/project.service';

export function useProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function openNewProject() {
    setName('');
    setDescription('');
    setPopupVisible(true);
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await projectService.create({ name, description });
      setPopupVisible(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, projectName: string) {
    const result = await dxConfirm(
      `¿Está seguro de que desea eliminar el proyecto "<b>${projectName}</b>"?`,
      'Confirmar eliminación',
    );
    if (!result) return;
    await projectService.remove(id);
    await loadData();
  }

  function handleRowClick(id: number) {
    router.push(`/projects/${id}`);
  }

  return {
    projects,
    loading,
    saving,
    popupVisible,
    name,
    description,
    setName,
    setDescription,
    setPopupVisible,
    openNewProject,
    handleCreate,
    handleDelete,
    handleRowClick,
  };
}
