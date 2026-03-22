'use client';

import { useCallback, useEffect, useState } from 'react';
import DataGrid, {
  Column,
  Paging,
  Pager,
  SearchPanel,
  FilterRow,
  Toolbar,
  Item,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import { DxForm, SimpleItem, GroupItem, ButtonItem } from '@/app/shared/components/dx-form';
import ScrollView from 'devextreme-react/scroll-view';
import LoadPanel from 'devextreme-react/load-panel';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { TaskItem } from '@/app/core/models/task.model';
import { User } from '@/app/core/models/user.model';
import { Project } from '@/app/core/models/project.model';
import { taskService } from '@/app/core/services/task.service';
import { projectService } from '@/app/core/services/project.service';
import { userService } from '@/app/core/services/user.service';

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

type TaskFormData = {
  title: string;
  description: string;
  priority: number;
  status: number;
  dueDate: string | null;
  assignedUserId: number | null;
  projectId: number | null;
};

const emptyForm = (): TaskFormData => ({
  title: '',
  description: '',
  priority: 1,
  status: 0,
  dueDate: null,
  assignedUserId: null,
  projectId: null,
});

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailPopupVisible, setDetailPopupVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<TaskItem | null>(null);

  const [formPopupVisible, setFormPopupVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [form, setForm] = useState<TaskFormData>(emptyForm());
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
    setForm(emptyForm());
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

  return (
    <div>
      <h2 className="tp-page-title">Tareas</h2>
      <p className="tp-page-subtitle">Gestión de todas las tareas de tus proyectos</p>

      <DataGrid
        dataSource={tasks}
        keyExpr="id"
        showBorders={false}
        rowAlternationEnabled
        hoverStateEnabled
        focusedRowEnabled
        focusedRowIndex={0}
        columnAutoWidth
        columnHidingEnabled
        loadPanel={{ enabled: loading }}
        noDataText="No hay tareas"
      >
        <Toolbar>
          <Item location="before">
            <Button text="Nueva Tarea" icon="plus" type="default" onClick={openNewTask} />
          </Item>
          <Item name="searchPanel" location="after" />
        </Toolbar>

        <SearchPanel visible placeholder="Buscar tarea..." />
        <FilterRow visible />
        <Paging pageSize={10} />
        <Pager showPageSizeSelector showInfo visible />

        <Column dataField="title" caption="Título" hidingPriority={100} />
        <Column
          dataField="status"
          caption="Estado"
          width={130}
          hidingPriority={90}
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
        <Column dataField="dueDate" caption="Vencimiento" dataType="date" width={120} hidingPriority={80} />
        <Column
          caption="Más"
          alignment="center"
          width={70}
          hidingPriority={999}
          allowHiding={false}
          cellRender={(cell) => (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button icon="more" stylingMode="text" onClick={(e) => { e.event?.stopPropagation(); showDetail(cell.data as TaskItem); }} />
            </div>
          )}
        />
      </DataGrid>

      {/* Detail Popup */}
      <Popup
        visible={detailPopupVisible}
        showTitle
        title="Detalle de Tarea"
        dragEnabled={false}
        width={550}
        height="auto"
        maxHeight="70vh"
        position={{ my: 'center', at: 'center', of: 'window' }}
        animation={{ show: { duration: 0 }, hide: { duration: 0 } }}
        wrapperAttr={{ className: 'detail-modal-responsive' }}
        onHiding={() => setDetailPopupVisible(false)}
        showCloseButton
      >
        <ScrollView>
          {selectedDetail && (
            <div style={{ padding: '10px 15px' }}>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Título:</span>
                <span style={detailValueStyle}>{selectedDetail.title}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Descripción:</span>
                <span style={detailValueStyle}>{selectedDetail.description || '—'}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Proyecto:</span>
                <span style={detailValueStyle}>{projectMap.get(selectedDetail.projectId) ?? `#${selectedDetail.projectId}`}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Prioridad:</span>
                <span style={detailValueStyle}>{PRIORITY_LABELS[selectedDetail.priority] ?? selectedDetail.priority}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Estado:</span>
                <span className="detail-value status-badge" style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  backgroundColor: selectedDetail.status === 'Completed' ? '#e8f5e9' : '#f5f5f5',
                  color: selectedDetail.status === 'Completed' ? '#2e7d32' : '#666',
                }}>
                  {STATUS_LABELS[selectedDetail.status] ?? selectedDetail.status}
                </span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Asignado a:</span>
                <span style={detailValueStyle}>{selectedDetail.assignedUserName || 'Sin asignar'}</span>
              </div>
              <div style={{ ...detailRowStyle, borderBottom: 'none', marginBottom: 20 }}>
                <span style={detailLabelStyle}>Vencimiento:</span>
                <span style={detailValueStyle}>
                  {selectedDetail.dueDate ? new Date(selectedDetail.dueDate).toLocaleDateString('es-ES') : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <Button
                  text="Editar"
                  type="default"
                  stylingMode="outlined"
                  width="48%"
                  onClick={() => openEditTask(selectedDetail)}
                />
                <Button
                  text="Eliminar"
                  type="danger"
                  stylingMode="outlined"
                  width="48%"
                  onClick={() => {
                    setDetailPopupVisible(false);
                    void handleDelete(selectedDetail);
                  }}
                />
              </div>
            </div>
          )}
        </ScrollView>
      </Popup>

      {/* Form Popup */}
      <Popup
        visible={formPopupVisible}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        width={520}
        height="auto"
        onHiding={() => setFormPopupVisible(false)}
        showCloseButton
        dragEnabled={false}
      >
        <ScrollView>
          <DxForm>
            <GroupItem caption="Información">
              <SimpleItem
                dataField="titulo"
                label={{ text: 'Título' }}
                editorType="dxTextBox"
                editorOptions={{
                  value: form.title,
                  onValueChanged: (e: { value: string }) => setForm((f) => ({ ...f, title: e.value })),
                  placeholder: 'Ej: Implementar autenticación',
                }}
                isRequired
              />
              {!editingTask && (
                <SimpleItem
                  dataField="proyecto"
                  label={{ text: 'Proyecto' }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    dataSource: projectOptions,
                    displayExpr: 'label',
                    valueExpr: 'value',
                    value: form.projectId,
                    onValueChanged: (e: { value: number }) => setForm((f) => ({ ...f, projectId: e.value })),
                    placeholder: 'Seleccionar proyecto',
                  }}
                  isRequired
                />
              )}
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
                label={{ text: 'Vencimiento' }}
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
                disabled: saving || !form.title.trim() || (!editingTask && !form.projectId),
                onClick: () => void handleSave(),
              }}
            />
          </DxForm>
        </ScrollView>
      </Popup>

      <LoadPanel visible={loading && tasks.length === 0} />
    </div>
  );
}

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #eee',
};

const detailLabelStyle: React.CSSProperties = {
  fontWeight: 500,
  color: '#666',
  fontSize: 14,
};

const detailValueStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#111',
  textAlign: 'right',
  fontWeight: 500,
};
