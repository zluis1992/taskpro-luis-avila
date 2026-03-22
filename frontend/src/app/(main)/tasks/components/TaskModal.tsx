'use client';

import { useEffect, useState } from 'react';
import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import SelectBox from 'devextreme-react/select-box';
import DateBox from 'devextreme-react/date-box';
import Button from 'devextreme-react/button';
import { TaskItem } from '@/app/core/models/task.model';
import { TaskFormData } from '../types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS } from '../constants';

export type TaskModalMode = 'view' | 'create' | 'edit';

type SelectOption = { value: number | null; label: string };

type Props = {
  mode: TaskModalMode;
  visible: boolean;
  task?: TaskItem | null;
  form?: TaskFormData;
  saving?: boolean;
  projectOptions?: SelectOption[];
  userOptions?: SelectOption[];
  projectName?: string;
  onFormChange?: (form: TaskFormData) => void;
  onHiding: () => void;
  onSave?: () => void;
  onEdit?: (task: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
};

const TITLES: Record<TaskModalMode, string> = {
  view: 'Detalle de Tarea',
  create: 'Nueva Tarea',
  edit: 'Editar Tarea',
};

export function TaskModal({
  mode,
  visible,
  task,
  form,
  saving,
  projectOptions = [],
  userOptions = [],
  projectName = '',
  onFormChange,
  onHiding,
  onSave,
  onEdit,
  onDelete,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const set = (partial: Partial<TaskFormData>) =>
    onFormChange?.({ ...form!, ...partial });

  const isView = mode === 'view';
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';

  const statusLabel = task ? (STATUS_LABELS[task.status] ?? task.status) : '';
  const statusColor = task ? (STATUS_COLORS[task.status] ?? '#64748b') : '#64748b';
  const priorityLabel = task ? (PRIORITY_LABELS[task.priority] ?? task.priority) : '';
  const dueDateLabel = task?.dueDate
    ? new Date(task.dueDate).toLocaleDateString('es-ES')
    : '—';

  return (
    <Popup
      key={TITLES[mode]}
      visible={visible}
      showTitle
      title={TITLES[mode]}
      width={isMobile ? '95vw' : 520}
      height="auto"
      maxHeight="100%"
      container=".taskpro-content"
      position={{ my: 'center', at: 'center', of: '.taskpro-content' }}
      onHiding={onHiding}
      showCloseButton
      dragEnabled={false}
    >
      <ScrollView showScrollbar="onHover" height={isMobile ? 'calc(100dvh - 120px)' : 'calc(100vh - 160px)'}>
        <div style={{ paddingTop: isMobile ? 12 : 16, paddingRight: isMobile ? 12 : 20, paddingBottom: 24, paddingLeft: isMobile ? 12 : 20, boxSizing: 'border-box' }}>

          {/* Título */}
          <Field label="Título" required={!isView}>
            {isView ? (
              <TextBox value={task?.title ?? ''} readOnly />
            ) : (
              <TextBox
                value={form?.title ?? ''}
                onValueChanged={(e) => set({ title: e.value as string })}
                placeholder="Ej: Implementar autenticación"
              />
            )}
          </Field>

          {/* Proyecto */}
          <Field label="Proyecto" required={!isView}>
            {isView ? (
              <TextBox value={projectName} readOnly />
            ) : (
              <SelectBox
                dataSource={projectOptions}
                displayExpr="label"
                valueExpr="value"
                value={form?.projectId ?? null}
                onValueChanged={(e) => set({ projectId: e.value as number })}
                placeholder="Seleccionar proyecto"
              />
            )}
          </Field>

          {/* Descripción */}
          <Field label="Descripción">
            {isView ? (
              <TextArea value={task?.description || '—'} height={80} readOnly />
            ) : (
              <TextArea
                value={form?.description ?? ''}
                onValueChanged={(e) => set({ description: e.value as string })}
                height={80}
                placeholder="Detalle de la tarea..."
              />
            )}
          </Field>

          {/* Prioridad + Estado */}
          <div style={{ display: 'grid', gridTemplateColumns: isCreate ? '1fr' : '1fr 1fr', gap: 16 }}>
            <Field label="Prioridad">
              {isView ? (
                <TextBox value={priorityLabel} readOnly />
              ) : (
                <SelectBox
                  dataSource={PRIORITY_OPTIONS}
                  displayExpr="label"
                  valueExpr="value"
                  value={form?.priority ?? 1}
                  onValueChanged={(e) => set({ priority: e.value as number })}
                />
              )}
            </Field>
            {(isView || isEdit) && (
              <Field label="Estado">
                {isView ? (
                  <div style={{
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    background: `${statusColor}18`,
                    color: statusColor,
                    border: `1px solid ${statusColor}40`,
                    boxSizing: 'border-box',
                  }}>
                    {statusLabel}
                  </div>
                ) : (
                  <SelectBox
                    dataSource={STATUS_OPTIONS}
                    displayExpr="label"
                    valueExpr="value"
                    value={form?.status ?? 0}
                    onValueChanged={(e) => set({ status: e.value as number })}
                  />
                )}
              </Field>
            )}
          </div>

          {/* Asignar a + Vencimiento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Asignar a">
              {isView ? (
                <TextBox value={task?.assignedUserName || 'Sin asignar'} readOnly />
              ) : (
                <SelectBox
                  dataSource={[{ value: null, label: 'Sin asignar' }, ...userOptions]}
                  displayExpr="label"
                  valueExpr="value"
                  value={form?.assignedUserId ?? null}
                  onValueChanged={(e) => set({ assignedUserId: e.value as number | null })}
                />
              )}
            </Field>
            <Field label="Vencimiento">
              {isView ? (
                <TextBox value={dueDateLabel} readOnly />
              ) : (
                <DateBox
                  value={form?.dueDate ?? undefined}
                  onValueChanged={(e) => set({ dueDate: e.value as string | null })}
                  displayFormat="dd/MM/yyyy"
                  pickerType="calendar"
                  min={new Date()}
                />
              )}
            </Field>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            {isView ? (
              <>
                <Button
                  text="Editar"
                  icon="edit"
                  type="default"
                  stylingMode="outlined"
                  onClick={() => task && onEdit?.(task)}
                />
                <Button
                  text="Eliminar"
                  icon="trash"
                  type="danger"
                  stylingMode="outlined"
                  onClick={() => { onHiding(); task && onDelete?.(task); }}
                />
              </>
            ) : (
              <Button
                text={saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Tarea'}
                type="default"
                icon="save"
                disabled={saving || !form?.title.trim() || (isCreate && !form?.projectId)}
                onClick={() => onSave?.()}
              />
            )}
          </div>

        </div>
      </ScrollView>
    </Popup>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
