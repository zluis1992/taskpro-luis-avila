'use client';

import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';
import { User } from '@/app/core/models/user.model';
import { ROLE_LABELS } from '../constants';

type Props = {
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
  user?: User | null;
  name: string;
  email: string;
  password: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onHiding: () => void;
  onSave: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: number, name: string) => void;
};

const TITLES: Record<'create' | 'edit' | 'view', string> = {
  create: 'Nuevo Usuario',
  edit: 'Editar Usuario',
  view: 'Detalle de Usuario',
};

export function UserFormPopup({
  visible,
  mode,
  user,
  name,
  email,
  password,
  saving,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onHiding,
  onSave,
  onEdit,
  onDelete,
}: Props) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : '';
  const createdLabel = user
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

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
          <Field label="Nombre" required={!isView}>
            <TextBox
              value={isView ? (user?.name ?? '') : name}
              readOnly={isView}
              onValueChanged={isView ? undefined : (e) => onNameChange(e.value as string)}
              placeholder={isView ? undefined : 'Nombre completo'}
            />
          </Field>

          <Field label="Correo electrónico" required={!isView}>
            <TextBox
              value={isView ? (user?.email ?? '') : email}
              readOnly={isView}
              onValueChanged={isView ? undefined : (e) => onEmailChange(e.value as string)}
              placeholder={isView ? undefined : 'correo@ejemplo.com'}
            />
          </Field>

          {isView && (
            <>
              <Field label="Rol">
                <TextBox value={roleLabel} readOnly />
              </Field>
              <Field label="Fecha de registro">
                <TextBox value={createdLabel} readOnly />
              </Field>
            </>
          )}

          {!isView && !isEdit && (
            <Field label="Contraseña" required>
              <TextBox
                value={password}
                mode="password"
                onValueChanged={(e) => onPasswordChange(e.value as string)}
                placeholder="Mínimo 6 caracteres"
              />
            </Field>
          )}

          {isEdit && (
            <Field label="Nueva contraseña">
              <TextBox
                value={password}
                mode="password"
                onValueChanged={(e) => onPasswordChange(e.value as string)}
                placeholder="Dejar vacío para no cambiar"
              />
            </Field>
          )}

          <div style={{ display: 'flex', justifyContent: isView ? 'space-between' : 'flex-end', gap: 12, marginTop: 20 }}>
            {isView ? (
              <>
                <Button
                  text="Editar"
                  icon="edit"
                  type="default"
                  stylingMode="outlined"
                  width="48%"
                  onClick={() => user && onEdit?.(user)}
                />
                <Button
                  text="Eliminar"
                  icon="trash"
                  type="danger"
                  stylingMode="outlined"
                  width="48%"
                  onClick={() => { onHiding(); user && onDelete?.(user.id, user.name); }}
                />
              </>
            ) : (
              <Button
                text={saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Usuario'}
                type="default"
                icon="save"
                disabled={saving || !name.trim() || !email.trim() || (!isEdit && !password.trim())}
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
