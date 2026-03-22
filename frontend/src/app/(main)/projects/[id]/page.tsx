'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DataGrid, {
  Column,
  Paging,
  SearchPanel,
  Toolbar,
  Item,
  FilterRow,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import { DxForm, SimpleItem, GroupItem, ButtonItem } from '@/app/shared/components/dx-form';
import ScrollView from 'devextreme-react/scroll-view';
import LoadPanel from 'devextreme-react/load-panel';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { Project } from '@/app/core/models/project.model';
import { TaskItem, TaskPriority, TaskStatus } from '@/app/core/models/task.model';
import { User } from '@/app/core/models/user.model';
import { projectService } from '@/app/core/services/project.service';
import { taskService } from '@/app/core/services/task.service';
import { userService } from '@/app/core/services/user.service';

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Baja' },
  { value: 1, label: 'Media' },
  { value: 2, label: 'Alta' },
  { value: 3, label: 'Crítica' },
];

const STATUS_OPTIONS = [
  { value: 0, label: 'Pendiente' },
  { value: 1, label: 'En progreso' },
  { value: 2, label: 'Completada' },
  { value: 3, label: 'Cancelada' },
];

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Completed: 'Completada',
  Cancelled: 'Cancelada',
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Crítica',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: '#d97706',
  InProgress: '#3399ff',
  Completed: '#28a745',
  Cancelled: '#dc3545',
};

type TaskForm = {
  title: string;
  description: string;
  priority: number;
  status: number;
  dueDate: string | null;
  assignedUserId: number | null;
};

const emptyForm = (): TaskForm => ({
  title: '',
  description: '',
  priority: 1,
  status: 0,
  dueDate: null,
  assignedUserId: null,
});

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm());
  const [saving, setSaving] = useState(false);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, taskList, userList] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProject(projectId),
        userService.getAll(),
      ]);
      setProject(proj);
      setTasks(taskList);
      setUsers(userList);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void loadData(); }, [loadData]);

  function openNewTask() {
    setEditingTask(null);
    setForm(emptyForm());
    setPopupVisible(true);
  }

  function openEditTask(task: TaskItem) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      priority: PRIORITY_OPTIONS.find((p) => p.label === PRIORITY_LABELS[task.priority])?.value ?? 1,
      status: STATUS_OPTIONS.find((s) => s.label === STATUS_LABELS[task.status])?.value ?? 0,
      dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : null,
      assignedUserId: task.assignedUserId ?? null,
    });
    setPopupVisible(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate,
          assignedUserId: form.assignedUserId,
        });
      } else {
        await taskService.create({
          projectId,
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate,
          assignedUserId: form.assignedUserId,
        });
      }
      setPopupVisible(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(taskId: number, taskTitle: string) {
    const result = await dxConfirm(
      `¿Está seguro de que desea eliminar la tarea "<b>${taskTitle}</b>"?`,
      'Confirmar eliminación',
    );
    if (!result) return;
    await taskService.remove(taskId);
    await loadData();
  }

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  if (loading && !project) return <LoadPanel visible />;
  if (!project) return <div>Proyecto no encontrado.</div>;

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Button
          icon="chevronleft"
          text="Proyectos"
          stylingMode="text"
          onClick={() => router.push('/projects')}
          style={{ marginLeft: -8 }}
        />
        <span style={{ color: 'var(--tp-text-secondary)' }}>/</span>
        <span className="tp-page-title" style={{ margin: 0 }}>{project.name}</span>
      </div>
      <div className="tp-page-subtitle">
        Propietario: {project.ownerName} · {project.members.length} miembro(s)
        {project.description && ` · ${project.description}`}
      </div>

      <DataGrid
        dataSource={tasks}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
        hoverStateEnabled
        onRowDblClick={(e) => router.push(`/projects/${projectId}/tasks/${e.data.id}`)}
        loadPanel={{ enabled: loading }}
        noDataText="No hay tareas en este proyecto"
      >
        <Toolbar>
          <Item location="before">
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tp-primary)' }}>
              Tareas del proyecto
            </span>
          </Item>
          <Item name="searchPanel" />
          <Item location="after">
            <Button text="Nueva Tarea" type="default" icon="plus" onClick={openNewTask} />
          </Item>
        </Toolbar>
        <SearchPanel visible placeholder="Buscar tarea..." />
        <FilterRow visible />
        <Paging pageSize={10} />

        <Column dataField="title" caption="Título" />
        <Column
          dataField="priority"
          caption="Prioridad"
          width={110}
          calculateCellValue={(row: TaskItem) => PRIORITY_LABELS[row.priority] ?? row.priority}
        />
        <Column
          dataField="status"
          caption="Estado"
          width={130}
          cellRender={(cell) => {
            const label = STATUS_LABELS[cell.value as string] ?? cell.value;
            const color = STATUS_COLORS[cell.value as string] ?? '#64748b';
            return (
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: `${color}18`,
                color,
                border: `1px solid ${color}40`,
              }}>
                {label}
              </span>
            );
          }}
        />
        <Column dataField="assignedUserName" caption="Asignado a" width={150} />
        <Column dataField="dueDate" caption="Vencimiento" dataType="date" width={120} />
        <Column
          caption="Acciones"
          width={160}
          alignment="center"
          cellRender={(cell) => (
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                icon="edit"
                text="Editar"
                stylingMode="text"
                onClick={(e) => {
                  e.event?.stopPropagation();
                  openEditTask(cell.data as TaskItem);
                }}
              />
              <Button
                icon="trash"
                type="danger"
                stylingMode="text"
                onClick={(e) => {
                  e.event?.stopPropagation();
                  void handleDelete(cell.data.id, cell.data.title);
                }}
              />
            </div>
          )}
        />
      </DataGrid>

      {/* Popup: Nueva / Editar Tarea */}
      <Popup
        visible={popupVisible}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        width={480}
        height="auto"
        onHiding={() => setPopupVisible(false)}
        showCloseButton
        dragEnabled={false}
      >
        <ScrollView>
          <DxForm>
            <GroupItem caption="Información de la tarea">
              <SimpleItem
                dataField="titulo"
                label={{ text: 'Título' }}
                editorType="dxTextBox"
                editorOptions={{
                  value: form.title,
                  onValueChanged: (e: { value: string }) => setForm((f) => ({ ...f, title: e.value })),
                  placeholder: 'Ej: Diseñar mockups de la pantalla principal',
                }}
                isRequired
              />
              <SimpleItem
                dataField="descripcion"
                label={{ text: 'Descripción' }}
                editorType="dxTextArea"
                editorOptions={{
                  value: form.description,
                  onValueChanged: (e: { value: string }) => setForm((f) => ({ ...f, description: e.value })),
                  height: 80,
                  placeholder: 'Detalle de la tarea...',
                }}
              />
            </GroupItem>
            <GroupItem colCount={2} caption="Clasificación">
              <SimpleItem
                dataField="prioridad"
                label={{ text: 'Prioridad' }}
                editorType="dxSelectBox"
                editorOptions={{
                  dataSource: PRIORITY_OPTIONS,
                  displayExpr: 'label',
                  valueExpr: 'value',
                  value: form.priority,
                  onValueChanged: (e: { value: number }) => setForm((f) => ({ ...f, priority: e.value })),
                }}
              />
              {editingTask && (
                <SimpleItem
                  dataField="estado"
                  label={{ text: 'Estado' }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    dataSource: STATUS_OPTIONS,
                    displayExpr: 'label',
                    valueExpr: 'value',
                    value: form.status,
                    onValueChanged: (e: { value: number }) => setForm((f) => ({ ...f, status: e.value })),
                  }}
                />
              )}
            </GroupItem>
            <GroupItem colCount={2} caption="Asignación y plazos">
              <SimpleItem
                dataField="asignado"
                label={{ text: 'Asignar a' }}
                editorType="dxSelectBox"
                editorOptions={{
                  dataSource: [{ value: null, label: 'Sin asignar' }, ...userOptions],
                  displayExpr: 'label',
                  valueExpr: 'value',
                  value: form.assignedUserId,
                  onValueChanged: (e: { value: number | null }) => setForm((f) => ({ ...f, assignedUserId: e.value })),
                }}
              />
              <SimpleItem
                dataField="vencimiento"
                label={{ text: 'Fecha de vencimiento' }}
                editorType="dxDateBox"
                editorOptions={{
                  value: form.dueDate,
                  onValueChanged: (e: { value: string | null }) => setForm((f) => ({ ...f, dueDate: e.value })),
                  displayFormat: 'dd/MM/yyyy',
                  pickerType: 'calendar',
                }}
              />
            </GroupItem>
            <ButtonItem
              horizontalAlignment="right"
              buttonOptions={{
                text: saving ? 'Guardando...' : editingTask ? 'Guardar cambios' : 'Crear Tarea',
                type: 'default',
                icon: 'save',
                disabled: saving || !form.title.trim(),
                onClick: () => void handleSave(),
              }}
            />
          </DxForm>
        </ScrollView>
      </Popup>
    </div>
  );
}
