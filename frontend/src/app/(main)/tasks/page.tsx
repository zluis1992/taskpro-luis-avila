'use client';

import LoadPanel from 'devextreme-react/load-panel';
import { useTasks } from './hooks/useTasks';
import { TaskDataGrid } from './components/TaskDataGrid';
import { TaskDetailPopup } from './components/TaskDetailPopup';
import { TaskFormPopup } from './components/TaskFormPopup';

export default function TasksPage() {
  const t = useTasks();

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

      <TaskDetailPopup
        visible={t.detailPopupVisible}
        task={t.selectedDetail}
        projectName={t.selectedDetail ? (t.projectMap.get(t.selectedDetail.projectId) ?? `#${t.selectedDetail.projectId}`) : ''}
        onHiding={() => t.setDetailPopupVisible(false)}
        onEdit={t.openEditTask}
        onDelete={t.handleDelete}
      />

      <TaskFormPopup
        visible={t.formPopupVisible}
        isEditing={!!t.editingTask}
        form={t.form}
        saving={t.saving}
        projectOptions={t.projectOptions}
        userOptions={t.userOptions}
        onFormChange={t.setForm}
        onHiding={() => t.setFormPopupVisible(false)}
        onSave={t.handleSave}
      />

      <LoadPanel visible={t.loading && t.tasks.length === 0} />
    </div>
  );
}
