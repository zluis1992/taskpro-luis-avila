'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, { Column, Paging, SearchPanel, Toolbar, Item } from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
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

  useEffect(() => { loadProjects(); }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await projectService.create({ name, description });
      setPopupVisible(false);
      setName('');
      setDescription('');
      await loadProjects();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project?')) return;
    await projectService.remove(id);
    await loadProjects();
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Projects</h1>
        <Button text="New Project" type="default" icon="plus" onClick={() => setPopupVisible(true)} />
      </div>

      <DataGrid
        dataSource={projects}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
        onRowClick={(e) => router.push(`/projects/${e.data.id}`)}
      >
        <SearchPanel visible />
        <Paging pageSize={10} />
        <Column dataField="name" caption="Name" />
        <Column dataField="description" caption="Description" />
        <Column dataField="ownerName" caption="Owner" width={140} />
        <Column
          dataField="members"
          caption="Members"
          width={90}
          calculateCellValue={(row: Project) => row.members?.length ?? 0}
        />
        <Column dataField="createdAt" caption="Created" dataType="date" width={120} />
        <Column
          caption="Actions"
          width={80}
          cellRender={(cell) => (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(cell.data.id); }}
              style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }}
            >
              Delete
            </button>
          )}
        />
      </DataGrid>

      <Popup
        visible={popupVisible}
        title="New Project"
        width={420}
        height="auto"
        onHiding={() => setPopupVisible(false)}
        showCloseButton
      >
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Name *</label>
            <TextBox value={name} onValueChanged={(e) => setName(e.value)} width="100%" />
          </div>
          <div>
            <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Description</label>
            <TextArea value={description} onValueChanged={(e) => setDescription(e.value)} height={80} width="100%" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button text="Cancel" onClick={() => setPopupVisible(false)} />
            <Button text={saving ? 'Saving...' : 'Create'} type="default" onClick={handleCreate} disabled={saving} />
          </div>
        </div>
      </Popup>
    </div>
  );
}
