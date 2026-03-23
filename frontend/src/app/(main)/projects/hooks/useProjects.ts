'use client';

import { useCallback, useEffect, useState } from 'react';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { Project } from '@/app/core/models/project.model';
import { projectService } from '@/app/core/services/project.service';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMode, setPopupMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await projectService.getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function openNewProject() {
    setSelectedProject(null);
    setPopupMode('create');
    setName('');
    setDescription('');
    setPopupVisible(true);
  }

  function handleView(project: Project) {
    setSelectedProject(project);
    setPopupMode('view');
    setPopupVisible(true);
  }

  function openEditProject(project: Project) {
    setSelectedProject(project);
    setPopupMode('edit');
    setName(project.name);
    setDescription(project.description ?? '');
    setPopupVisible(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (popupMode === 'edit' && selectedProject) {
        await projectService.update(selectedProject.id, { name, description });
      } else {
        await projectService.create({ name, description });
      }
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
    setPopupVisible(false);
    await loadData();
  }

  return {
    projects,
    loading,
    saving,
    popupVisible,
    popupMode,
    selectedProject,
    name,
    description,
    setName,
    setDescription,
    setPopupVisible,
    openNewProject,
    handleView,
    openEditProject,
    handleSave,
    handleDelete,
  };
}
