'use client';

import PieChart, { Series, Label, Legend } from 'devextreme-react/pie-chart';

type StatusData = { status: string; count: number; color: string };

type Props = { data: StatusData[] };

export function TaskPieChart({ data }: Props) {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', color: '#999', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Sin datos de tareas
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 16 }}>Tareas por estado</div>
      <PieChart
        dataSource={filtered}
        palette={filtered.map((d) => d.color)}
        type="doughnut"
      >
        <Series argumentField="status" valueField="count">
          <Label visible format="fixedPoint" />
        </Series>
        <Legend orientation="horizontal" horizontalAlignment="center" verticalAlignment="bottom" />
      </PieChart>
    </div>
  );
}
