'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, {
  Column,
  Paging,
  Toolbar,
  Item,
  SearchPanel,
  FilterRow,
  HeaderFilter,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { Project } from '@/app/core/models/project.model';
import { projectService } from '@/app/core/services/project.service';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getAll()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="tp-page-title">Dashboard</div>
      <div className="tp-page-subtitle">Resumen general de proyectos activos</div>

      <DataGrid
        dataSource={projects}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
        hoverStateEnabled
        onRowClick={(e) => router.push(`/projects/${e.data.id}`)}
        loadPanel={{ enabled: loading }}
        noDataText="Sin proyectos registrados"
        wordWrapEnabled
      >
        <Toolbar>
          <Item location="before">
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tp-primary)' }}>
              Proyectos — {loading ? '...' : projects.length} en total
            </span>
          </Item>
          <Item name="searchPanel" />
          <Item location="after">
            <Button
              icon="folder"
              text="Ver todos los proyectos"
              type="default"
              stylingMode="contained"
              onClick={() => router.push('/projects')}
            />
          </Item>
        </Toolbar>
        <SearchPanel visible placeholder="Buscar proyecto..." />
        <FilterRow visible />
        <HeaderFilter visible />
        <Paging pageSize={10} />
        <Column dataField="name" caption="Proyecto" />
        <Column dataField="ownerName" caption="Propietario" width={180} />
        <Column
          dataField="members"
          caption="Miembros"
          width={100}
          alignment="center"
          calculateCellValue={(row: Project) => row.members?.length ?? 0}
        />
        <Column dataField="createdAt" caption="Fecha de creación" dataType="date" width={160} />
      </DataGrid>
    </div>
  );
}
