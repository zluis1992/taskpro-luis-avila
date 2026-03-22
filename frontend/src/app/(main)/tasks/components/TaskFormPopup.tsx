'use client';

import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import { DxForm, SimpleItem, GroupItem, ButtonItem } from '@/app/shared/components/dx-form';
import { TaskFormData } from '../types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants';

type SelectOption = { value: number | null; label: string };

type Props = {
  visible: boolean;
  isEditing: boolean;
  form: TaskFormData;
  saving: boolean;
  projectOptions: SelectOption[];
  userOptions: SelectOption[];
  onFormChange: (form: TaskFormData) => void;
  onHiding: () => void;
  onSave: () => void;
};

export function TaskFormPopup({
  visible,
  isEditing,
  form,
  saving,
  projectOptions,
  userOptions,
  onFormChange,
  onHiding,
  onSave,
}: Props) {
  const set = (partial: Partial<TaskFormData>) => onFormChange({ ...form, ...partial });

  return (
    <Popup
      visible={visible}
      showTitle
      title={isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
      width={520}
      height={600}
      onHiding={onHiding}
      showCloseButton
      dragEnabled={false}
    >
      <ScrollView height="100%" showScrollbar="onHover">
        <DxForm>
          <GroupItem caption="Información">
            <SimpleItem
              dataField="titulo"
              label={{ text: 'Título' }}
              editorType="dxTextBox"
              editorOptions={{
                value: form.title,
                onValueChanged: (e: { value: string }) => set({ title: e.value }),
                placeholder: 'Ej: Implementar autenticación',
              }}
              isRequired
            />
            {!isEditing && (
              <SimpleItem
                dataField="proyecto"
                label={{ text: 'Proyecto' }}
                editorType="dxSelectBox"
                editorOptions={{
                  dataSource: projectOptions,
                  displayExpr: 'label',
                  valueExpr: 'value',
                  value: form.projectId,
                  onValueChanged: (e: { value: number }) => set({ projectId: e.value }),
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
                onValueChanged: (e: { value: string }) => set({ description: e.value }),
                height: '80px',
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
                onValueChanged: (e: { value: number }) => set({ priority: e.value }),
              }}
            />
            {isEditing && (
              <SimpleItem
                dataField="estado"
                label={{ text: 'Estado' }}
                editorType="dxSelectBox"
                editorOptions={{
                  dataSource: STATUS_OPTIONS,
                  displayExpr: 'label',
                  valueExpr: 'value',
                  value: form.status,
                  onValueChanged: (e: { value: number }) => set({ status: e.value }),
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
                onValueChanged: (e: { value: number | null }) => set({ assignedUserId: e.value }),
              }}
            />
            <SimpleItem
              dataField="vencimiento"
              label={{ text: 'Vencimiento' }}
              editorType="dxDateBox"
              editorOptions={{
                value: form.dueDate,
                onValueChanged: (e: { value: string | null }) => set({ dueDate: e.value }),
                displayFormat: 'dd/MM/yyyy',
                pickerType: 'calendar',
              }}
            />
          </GroupItem>
          <ButtonItem
            horizontalAlignment="right"
            buttonOptions={{
              text: saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear Tarea',
              type: 'default',
              icon: 'save',
              disabled: saving || !form.title.trim() || (!isEditing && !form.projectId),
              onClick: () => onSave(),
            }}
          />
        </DxForm>
      </ScrollView>
    </Popup>
  );
}
