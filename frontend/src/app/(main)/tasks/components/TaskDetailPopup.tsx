'use client';

import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import { TaskItem } from '@/app/core/models/task.model';
import { STATUS_LABELS, PRIORITY_LABELS } from '../constants';

type Props = {
  visible: boolean;
  task: TaskItem | null;
  projectName: string;
  onHiding: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
};

export function TaskDetailPopup({ visible, task, projectName, onHiding, onEdit, onDelete }: Props) {
  if (!task) return null;

  return (
    <Popup
      visible={visible}
      showTitle
      title="Detalle de Tarea"
      dragEnabled={false}
      width={550}
      height="auto"
      maxHeight="70vh"
      position={{ my: 'center', at: 'center', of: 'window' }}
      animation={{ show: { duration: 0 }, hide: { duration: 0 } }}
      wrapperAttr={{ className: 'detail-modal-responsive' }}
      onHiding={onHiding}
      showCloseButton
    >
      <ScrollView>
        <div style={{ padding: '10px 15px' }}>
          <DetailRow label="Título" value={task.title} />
          <DetailRow label="Descripción" value={task.description || '—'} />
          <DetailRow label="Proyecto" value={projectName} />
          <DetailRow label="Prioridad" value={PRIORITY_LABELS[task.priority] ?? task.priority} />
          <DetailRow label="Estado" value={STATUS_LABELS[task.status] ?? task.status} />
          <DetailRow label="Asignado a" value={task.assignedUserName || 'Sin asignar'} />
          <DetailRow
            label="Vencimiento"
            value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : '—'}
            noBorder
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 20 }}>
            <Button
              text="Editar"
              icon="edit"
              type="default"
              stylingMode="outlined"
              width="48%"
              onClick={() => onEdit(task)}
            />
            <Button
              text="Eliminar"
              icon="trash"
              type="danger"
              stylingMode="outlined"
              width="48%"
              onClick={() => {
                onHiding();
                onDelete(task);
              }}
            />
          </div>
        </div>
      </ScrollView>
    </Popup>
  );
}

function DetailRow({ label, value, noBorder }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: noBorder ? 'none' : '1px solid #eee',
      marginBottom: noBorder ? 20 : 0,
    }}>
      <span style={{ fontWeight: 500, color: '#666', fontSize: 14 }}>{label}:</span>
      <span style={{ fontSize: 14, color: '#111', textAlign: 'right', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
