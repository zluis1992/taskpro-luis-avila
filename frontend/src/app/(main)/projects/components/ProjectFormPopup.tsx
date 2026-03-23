'use client';

import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import Button from 'devextreme-react/button';
import { Project } from '@/app/core/models/project.model';

type Props = {
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
  project?: Project | null;
  name: string;
  description: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onHiding: () => void;
  onSave: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (id: number, name: string) => void;
};

const TITLES: Record<'create' | 'edit' | 'view', string> = {
  create: 'Nuevo Proyecto',
  edit: 'Editar Proyecto',
  view: 'Detalle de Proyecto',
};

export function ProjectFormPopup({
  visible,
  mode,
  project,
  name,
  description,
  saving,
  onNameChange,
  onDescriptionChange,
  onHiding,
  onSave,
  onEdit,
  onDelete,
}: Props) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';


  return (
    <Popup
      visible={visible}
      title={TITLES[mode]}
      width={440}
      height="auto"
      container=".taskpro-content"
      onHiding={onHiding}
      showCloseButton
      dragEnabled={false}
    >
      <ScrollView>
        <div style={{ padding: '16px 20px 24px' }}>
          <Field label="Nombre del proyecto" required={!isView}>
            <TextBox
              value={isView ? (project?.name ?? '') : name}
              readOnly={isView}
              onValueChanged={isView ? undefined : (e) => onNameChange(e.value as string)}
              placeholder={isView ? undefined : 'Ej: Rediseño de sitio web'}
            />
          </Field>

          <Field label="Descripción">
            <TextArea
              value={isView ? (project?.description || '—') : description}
              readOnly={isView}
              height={100}
              onValueChanged={isView ? undefined : (e) => onDescriptionChange(e.value as string)}
              placeholder={isView ? undefined : 'Describe el objetivo del proyecto...'}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: isView ? 'space-between' : 'flex-end', gap: 12, marginTop: 20 }}>
            {isView ? (
              <>
                <Button
                  text="Editar"
                  icon="edit"
                  type="default"
                  stylingMode="outlined"
                  width="48%"
                  onClick={() => project && onEdit?.(project)}
                />
                <Button
                  text="Eliminar"
                  icon="trash"
                  type="danger"
                  stylingMode="outlined"
                  width="48%"
                  onClick={() => { onHiding(); project && onDelete?.(project.id, project.name); }}
                />
              </>
            ) : (
              <Button
                text={saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Proyecto'}
                type="default"
                icon="save"
                disabled={saving || !name.trim()}
                onClick={onSave}
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
