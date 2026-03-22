'use client';

import { useEffect, useState } from 'react';
import DataGrid, {
  Column,
  Paging,
  SearchPanel,
  Toolbar,
  Item,
  FilterRow,
  HeaderFilter,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { User } from '@/app/core/models/user.model';
import { userService } from '@/app/core/services/user.service';

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Administrador',
  Member: 'Miembro',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  async function handleDelete(id: number, userName: string) {
    const result = await dxConfirm(
      `¿Está seguro de que desea eliminar al usuario "<b>${userName}</b>"?`,
      'Confirmar eliminación',
    );
    if (!result) return;
    await userService.remove(id);
    await loadUsers();
  }

  return (
    <div>
      <div className="tp-page-title">Usuarios</div>
      <div className="tp-page-subtitle">Gestión de usuarios del sistema</div>

      <DataGrid
        dataSource={users}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
        hoverStateEnabled
        loadPanel={{ enabled: loading }}
        noDataText="Sin usuarios registrados"
      >
        <Toolbar>
          <Item location="before">
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tp-primary)' }}>
              Lista de Usuarios
            </span>
          </Item>
          <Item name="searchPanel" />
          <Item location="after">
            <Button
              icon="refresh"
              text="Actualizar"
              stylingMode="outlined"
              onClick={() => void loadUsers()}
              disabled={loading}
            />
          </Item>
        </Toolbar>
        <SearchPanel visible placeholder="Buscar usuario..." />
        <FilterRow visible />
        <HeaderFilter visible />
        <Paging pageSize={10} />

        <Column dataField="name" caption="Nombre" />
        <Column dataField="email" caption="Correo electrónico" />
        <Column
          dataField="role"
          caption="Rol"
          width={140}
          calculateCellValue={(row: User) => ROLE_LABELS[row.role] ?? row.role}
        />
        <Column dataField="createdAt" caption="Fecha de registro" dataType="date" width={160} />
        <Column
          caption="Acciones"
          width={110}
          alignment="center"
          cellRender={(cell) => (
            <Button
              icon="trash"
              text="Eliminar"
              type="danger"
              stylingMode="text"
              onClick={() => void handleDelete(cell.data.id, cell.data.name)}
            />
          )}
        />
      </DataGrid>
    </div>
  );
}
