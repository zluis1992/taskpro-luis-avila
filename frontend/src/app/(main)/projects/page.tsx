'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import Popup from 'devextreme-react/popup';
import { DxForm, ButtonItem, SimpleItem, GroupItem } from '@/app/shared/components/dx-form';
import ScrollView from 'devextreme-react/scroll-view';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { Project } from '@/app/core/models/project.model';
import { projectService } from '@/app/core/services/project.service';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProjects(); }, []);

  function openNewProjectPopup() {
    setName('');
    setDescription('');
    setPopupVisible(true);
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await projectService.create({ name, description });
      setPopupVisible(false);
      await loadProjects();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, projectName: string) {
    const result = await dxConfirm(
      `¿Está seguro de que desea eliminar el proyecto "<b>${projectName}</b>"? Esta acción no se puede deshacer.`,
      'Confirmar eliminación',
    );
    if (!result) return;
    await projectService.remove(id);
    await loadProjects();
  }

  return (
    <div>
      <div className="tp-page-title">Proyectos</div>
      <div className="tp-page-subtitle">Gestión de proyectos y equipos de trabajo</div>

      <DataGrid
        dataSource={projects}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
        hoverStateEnabled
        onRowClick={(e) => router.push(`/projects/${e.data.id}`)}
        loadPanel={{ enabled: loading }}
        noDataText="No hay proyectos registrados"
        wordWrapEnabled
      >
        <Toolbar>
          <Item location="before">
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tp-primary)' }}>
              Lista de Proyectos
            </span>
          </Item>
          <Item name="searchPanel" />
          <Item location="after">
            <Button
              text="Nuevo Proyecto"
              type="default"
              icon="plus"
              onClick={openNewProjectPopup}
            />
          </Item>
        </Toolbar>
        <SearchPanel visible placeholder="Buscar..." />
        <FilterRow visible />
        <HeaderFilter visible />
        <Paging pageSize={10} />

        <Column dataField="name" caption="Nombre" />
        <Column dataField="description" caption="Descripción" />
        <Column dataField="ownerName" caption="Propietario" width={160} />
        <Column
          dataField="members"
          caption="Miembros"
          width={90}
          alignment="center"
          calculateCellValue={(row: Project) => row.members?.length ?? 0}
        />
        <Column dataField="createdAt" caption="Creado" dataType="date" width={120} />
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
              onClick={(e) => {
                e.event?.stopPropagation();
                void handleDelete(cell.data.id, cell.data.name);
              }}
            />
          )}
        />
      </DataGrid>

      {/* Popup: Nuevo Proyecto */}
      <Popup
        visible={popupVisible}
        title="Nuevo Proyecto"
        width={440}
        height="auto"
        onHiding={() => setPopupVisible(false)}
        showCloseButton
        dragEnabled={false}
      >
        <ScrollView>
          <DxForm>
            <GroupItem caption="Información del proyecto">
              <SimpleItem
                dataField="nombre"
                label={{ text: 'Nombre del proyecto' }}
                editorType="dxTextBox"
                editorOptions={{
                  value: name,
                  onValueChanged: (e: { value: string }) => setName(e.value),
                  placeholder: 'Ej: Rediseño de sitio web',
                }}
                isRequired
              />
              <SimpleItem
                dataField="descripcion"
                label={{ text: 'Descripción' }}
                editorType="dxTextArea"
                editorOptions={{
                  value: description,
                  onValueChanged: (e: { value: string }) => setDescription(e.value),
                  height: 100,
                  placeholder: 'Describe el objetivo del proyecto...',
                }}
              />
            </GroupItem>
            <ButtonItem
              horizontalAlignment="right"
              buttonOptions={{
                text: saving ? 'Guardando...' : 'Crear Proyecto',
                type: 'default',
                icon: 'save',
                disabled: saving || !name.trim(),
                onClick: () => void handleCreate(),
              }}
            />
          </DxForm>
        </ScrollView>
      </Popup>
    </div>
  );
}
