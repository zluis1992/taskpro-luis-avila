"use client";

import DataGrid, {
  Column,
  Paging,
  Pager,
  FilterRow,
  Toolbar,
  Item,
} from "devextreme-react/data-grid";
import Button from "devextreme-react/button";
import {TaskItem} from "@/app/core/models/task.model";
import {STATUS_LABELS, STATUS_COLORS} from "../constants";

type Props = {
  tasks: TaskItem[];
  loading: boolean;
  projectMap: Map<number, string>;
  onNew: () => void;
  onView: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
};

export function TaskDataGrid({
  tasks,
  loading,
  projectMap,
  onNew,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <DataGrid
      dataSource={tasks}
      keyExpr="id"
      showBorders={false}
      rowAlternationEnabled
      hoverStateEnabled
      focusedRowEnabled
      focusedRowIndex={0}
      columnAutoWidth
      width="100%"
      loadPanel={{enabled: loading}}
      noDataText="No hay tareas">
      <Toolbar>
        <Item location="before">
          <Button
            text="Nueva Tarea"
            icon="plus"
            type="default"
            onClick={onNew}
          />
        </Item>
        <Item name="searchPanel" location="after" />
      </Toolbar>

      <FilterRow visible />
      <Paging pageSize={10} />
      <Pager showPageSizeSelector showInfo visible />

      <Column dataField="title" caption="Título" width={300} />
      <Column
        width={300}
        dataField="projectId"
        caption="Proyecto"
        calculateCellValue={(row: TaskItem) =>
          projectMap.get(row.projectId) ?? `Proyecto #${row.projectId}`
        }
      />
      <Column
        dataField="status"
        caption="Estado"
        width={130}
        cellRender={(cell) => {
          const label = STATUS_LABELS[cell.value as string] ?? cell.value;
          const color = STATUS_COLORS[cell.value as string] ?? "#64748b";
          return (
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: `${color}18`,
                color,
                border: `1px solid ${color}40`,
              }}>
              {label}
            </span>
          );
        }}
      />
      <Column
        dataField="dueDate"
        caption="Vencimiento"
        dataType="date"
        width={120}
      />
      <Column
        caption="Acciones"
        width={100}
        alignment="center"
        allowHiding={false}
        cellRender={(cell) => (
          <div style={{display: "flex", gap: 2, justifyContent: "center"}}>
            <Button
              icon="eyeopen"
              hint="Ver detalle"
              stylingMode="text"
              onClick={(e) => {
                e.event?.stopPropagation();
                onView(cell.data as TaskItem);
              }}
            />
            <Button
              icon="edit"
              hint="Editar"
              stylingMode="text"
              onClick={(e) => {
                e.event?.stopPropagation();
                onEdit(cell.data as TaskItem);
              }}
            />
            <Button
              icon="trash"
              hint="Eliminar"
              type="danger"
              stylingMode="text"
              onClick={(e) => {
                e.event?.stopPropagation();
                onDelete(cell.data as TaskItem);
              }}
            />
          </div>
        )}
      />
    </DataGrid>
  );
}
