'use client';

import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import Button from 'devextreme-react/button';
import { User } from '@/app/core/models/user.model';
import { ROLE_LABELS } from '../constants';

type Props = {
  visible: boolean;
  user: User | null;
  onHiding: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: number, name: string) => void;
};

export function UserDetailPopup({ visible, user, onHiding, onEdit, onDelete }: Props) {
  if (!user) return null;

  return (
    <Popup
      visible={visible}
      showTitle
      title="Detalle de Usuario"
      dragEnabled={false}
      width={500}
      height="auto"
      maxHeight="70vh"
      position={{ my: 'center', at: 'center', of: 'window' }}
      animation={{ show: { duration: 0 }, hide: { duration: 0 } }}
      onHiding={onHiding}
      showCloseButton
    >
      <ScrollView>
        <div style={{ padding: '10px 15px' }}>
          <DetailRow label="Nombre" value={user.name} />
          <DetailRow label="Correo electrónico" value={user.email} />
          <DetailRow label="Rol" value={ROLE_LABELS[user.role] ?? user.role} />
          <DetailRow
            label="Fecha de registro"
            value={new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            noBorder
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 20 }}>
            <Button
              text="Editar"
              icon="edit"
              type="default"
              stylingMode="outlined"
              width="48%"
              onClick={() => onEdit(user)}
            />
            <Button
              text="Eliminar"
              icon="trash"
              type="danger"
              stylingMode="outlined"
              width="48%"
              onClick={() => {
                onHiding();
                onDelete(user.id, user.name);
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
