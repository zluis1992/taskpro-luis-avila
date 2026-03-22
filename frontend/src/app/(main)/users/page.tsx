'use client';

import { useUsers } from './hooks/useUsers';
import { UserDataGrid } from './components/UserDataGrid';
import { UserFormPopup } from './components/UserFormPopup';

export default function UsersPage() {
  const u = useUsers();

  return (
    <div>
      <h2 className="tp-page-title">Usuarios</h2>
      <p className="tp-page-subtitle">Gestión de usuarios del sistema</p>

      <UserDataGrid
        users={u.users}
        loading={u.loading}
        onNew={u.handleNew}
        onView={u.handleView}
        onEdit={u.handleEdit}
        onDelete={u.handleDelete}
      />

      <UserFormPopup
        visible={u.popupVisible}
        name={u.name}
        email={u.email}
        password={u.password}
        saving={u.saving}
        onNameChange={u.setName}
        onEmailChange={u.setEmail}
        onPasswordChange={u.setPassword}
        onHiding={() => u.setPopupVisible(false)}
        onSave={u.handleCreate}
      />
    </div>
  );
}
