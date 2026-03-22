'use client';

import { useProjects } from './hooks/useProjects';
import { ProjectDataGrid } from './components/ProjectDataGrid';
import { ProjectFormPopup } from './components/ProjectFormPopup';

export default function ProjectsPage() {
  const p = useProjects();

  return (
    <div>
      <h2 className="tp-page-title">Proyectos</h2>
      <p className="tp-page-subtitle">Gestión de proyectos y equipos de trabajo</p>

      <ProjectDataGrid
        projects={p.projects}
        loading={p.loading}
        onNew={p.openNewProject}
        onRowClick={p.handleRowClick}
        onDelete={p.handleDelete}
      />

      <ProjectFormPopup
        visible={p.popupVisible}
        name={p.name}
        description={p.description}
        saving={p.saving}
        onNameChange={p.setName}
        onDescriptionChange={p.setDescription}
        onHiding={() => p.setPopupVisible(false)}
        onSave={p.handleCreate}
      />
    </div>
  );
}
