'use client';

import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';

type Props = {
  visible: boolean;
  name: string;
  email: string;
  password: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onHiding: () => void;
  onSave: () => void;
};

export function UserFormPopup({
  visible,
  name,
  email,
  password,
  saving,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onHiding,
  onSave,
}: Props) {
  return (
    <Popup
      visible={visible}
      title="Nuevo Usuario"
      width={440}
      height="auto"
      container=".taskpro-content"
      onHiding={onHiding}
      showCloseButton
      dragEnabled={false}
    >
      <ScrollView>
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              Nombre <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <TextBox
              value={name}
              onValueChanged={(e) => onNameChange(e.value as string)}
              placeholder="Nombre completo"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              Correo electrónico <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <TextBox
              value={email}
              onValueChanged={(e) => onEmailChange(e.value as string)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
              Contraseña <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <TextBox
              value={password}
              mode="password"
              onValueChanged={(e) => onPasswordChange(e.value as string)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              text={saving ? 'Guardando...' : 'Crear Usuario'}
              type="default"
              icon="save"
              disabled={saving || !name.trim() || !email.trim() || !password.trim()}
              onClick={onSave}
            />
          </div>
        </div>
      </ScrollView>
    </Popup>
  );
}
