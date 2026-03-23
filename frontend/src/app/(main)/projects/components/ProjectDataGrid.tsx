'use client';

import DataGrid, { Column, Scrolling, Toolbar, Item, FilterRow } from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { Project } from '@/app/core/models/project.model';

type Props = {
  projects: Project[];
  loading: boolean;
  onNew: () => void;
  onView: (id: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: number, name: string) => void;
};

export function ProjectDataGrid({ projects, loading, onNew, onView, onEdit, onDelete }: Props) {
  return (
    <DataGrid
      dataSource={projects}
      keyExpr="id"
      showBorders={false}
      rowAlternationEnabled
      hoverStateEnabled
      columnAutoWidth
      width="100%"
      height={500}
      loadPanel={{ enabled: loading }}
      noDataText="No hay proyectos registrados"
    >
      <Toolbar>
        <Item location="before">
          <Button text="Nuevo Proyecto" type="default" icon="plus" onClick={onNew} />
        </Item>
        <Item name="searchPanel" location="after" />
      </Toolbar>
      <FilterRow visible />
      <Scrolling mode="virtual" rowRenderingMode="virtual" />

      <Column dataField="name" caption="Nombre" minWidth={150} />
      <Column dataField="description" caption="Descripción" minWidth={200} />
      <Column dataField="ownerName" caption="Propietario" width={160} />
      <Column
        dataField="members"
        caption="Miembros"
        width={100}
        alignment="center"
        calculateCellValue={(row: Project) => row.members?.length ?? 0}
      />
      <Column dataField="createdAt" caption="Creado" dataType="date" width={120} />
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
              onClick={(e) => { e.event?.stopPropagation(); onView(cell.data.id); }}
            />
            <Button
              icon="edit"
              hint="Editar"
              stylingMode="text"
              onClick={(e) => { e.event?.stopPropagation(); onEdit(cell.data as Project); }}
            />
            <Button
              icon="trash"
              hint="Eliminar"
              type="danger"
              stylingMode="text"
              onClick={(e) => { e.event?.stopPropagation(); onDelete(cell.data.id, cell.data.name); }}
            />
          </div>
        )}
      />
    </DataGrid>
  );
}
