'use client';

import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import Button from 'devextreme-react/button';

type Props = {
  visible: boolean;
  name: string;
  description: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onHiding: () => void;
  onSave: () => void;
};

export function ProjectFormPopup({
  visible,
  name,
  description,
  saving,
  onNameChange,
  onDescriptionChange,
  onHiding,
  onSave,
}: Props) {
  return (
    <Popup
      visible={visible}
      title="Nuevo Proyecto"
      width={440}
      height="auto"
      onHiding={onHiding}
      showCloseButton
      dragEnabled={false}
    >
      <ScrollView>
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              Nombre del proyecto <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <TextBox
              value={name}
              onValueChanged={(e) => onNameChange(e.value as string)}
              placeholder="Ej: Rediseño de sitio web"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              Descripción
            </label>
            <TextArea
              value={description}
              onValueChanged={(e) => onDescriptionChange(e.value as string)}
              height={100}
              placeholder="Describe el objetivo del proyecto..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              text={saving ? 'Guardando...' : 'Crear Proyecto'}
              type="default"
              icon="save"
              disabled={saving || !name.trim()}
              onClick={onSave}
            />
          </div>
        </div>
      </ScrollView>
    </Popup>
  );
}
