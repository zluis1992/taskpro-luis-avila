'use client';

import LoadPanel from 'devextreme-react/load-panel';
import { useTasks } from './hooks/useTasks';
import { TaskDataGrid } from './components/TaskDataGrid';
import { TaskModal } from './components/TaskModal';

export default function TasksPage() {
  const t = useTasks();

  const modalMode = t.detailPopupVisible ? 'view'
    : t.editingTask ? 'edit'
    : 'create';

  const modalVisible = t.detailPopupVisible || t.formPopupVisible;

  const projectName = t.selectedDetail
    ? (t.projectMap.get(t.selectedDetail.projectId) ?? `#${t.selectedDetail.projectId}`)
    : '';

  return (
    <div>
      <h2 className="tp-page-title">Tareas</h2>
      <p className="tp-page-subtitle">Gestión de todas las tareas de tus proyectos</p>

      <TaskDataGrid
        tasks={t.tasks}
        loading={t.loading}
        projectMap={t.projectMap}
        onNew={t.openNewTask}
        onView={t.showDetail}
        onEdit={t.openEditTask}
        onDelete={t.handleDelete}
      />

      <TaskModal
        mode={modalMode}
        visible={modalVisible}
        task={t.selectedDetail ?? t.editingTask}
        form={t.form}
        saving={t.saving}
        projectOptions={t.projectOptions}
        userOptions={t.userOptions}
        projectName={projectName}
        onFormChange={t.setForm}
        onHiding={() => {
          t.setDetailPopupVisible(false);
          t.setFormPopupVisible(false);
        }}
        onSave={t.handleSave}
        onEdit={t.openEditTask}
        onDelete={t.handleDelete}
      />

      <LoadPanel visible={t.loading && t.tasks.length === 0} />
    </div>
  );
}
