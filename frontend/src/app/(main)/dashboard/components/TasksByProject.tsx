'use client';

import Chart, { Series, ArgumentAxis, ValueAxis, Label, CommonSeriesSettings } from 'devextreme-react/chart';
import type { ProjectTaskCount } from '../hooks/useDashboard';

type Props = { data: ProjectTaskCount[] };

export function TasksByProject({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', color: '#999', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Sin datos de proyectos
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 16 }}>Tareas por proyecto</div>
      <Chart dataSource={data} rotated>
        <CommonSeriesSettings argumentField="projectName" valueField="count" type="bar" color="#6366f1" />
        <Series>
          <Label visible position="outside" />
        </Series>
        <ArgumentAxis />
        <ValueAxis />
      </Chart>
    </div>
  );
}
