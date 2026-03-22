'use client';

import DataGrid, { Column, Paging, Toolbar, Item, FilterRow, HeaderFilter } from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { User } from '@/app/core/models/user.model';
import { ROLE_LABELS } from '../constants';

type Props = {
  users: User[];
  loading: boolean;
  onNew: () => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number, name: string) => void;
};

export function UserDataGrid({ users, loading, onNew, onView, onEdit, onDelete }: Props) {
  return (
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
          <Button text="Nuevo Usuario" type="default" icon="plus" onClick={onNew} />
        </Item>
      </Toolbar>
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
      <Column dataField="createdAt" caption="Registro" dataType="date" width={120} />
      <Column
        caption="Acciones"
        width={120}
        alignment="center"
        allowHiding={false}
        cellRender={(cell) => (
          <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              icon="eyeopen"
              hint="Ver detalle"
              stylingMode="text"
              onClick={() => onView(cell.data)}
            />
            <Button
              icon="edit"
              hint="Editar"
              stylingMode="text"
              onClick={() => onEdit(cell.data)}
            />
            <Button
              icon="trash"
              hint="Eliminar"
              type="danger"
              stylingMode="text"
              onClick={() => onDelete(cell.data.id, cell.data.name)}
            />
          </div>
        )}
      />
    </DataGrid>
  );
}
