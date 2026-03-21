'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DataGrid, { Column, Paging, SearchPanel } from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import SelectBox from 'devextreme-react/select-box';
import { Project } from '@/app/core/models/project.model';
import { TaskItem } from '@/app/core/models/task.model';
import { projectService } from '@/app/core/services/project.service';
import { taskService } from '@/app/core/services/task.service';

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low' }, { value: 1, label: 'Medium' },
  { value: 2, label: 'High' }, { value: 3, label: 'Critical' }
];

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b', InProgress: '#3b82f6', Completed: '#10b981', Cancelled: '#ef4444'
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState(1);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [proj, taskList] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProject(projectId)
      ]);
      setProject(proj);
      setTasks(taskList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [projectId]);

  async function handleCreateTask() {
    if (!taskTitle.trim()) return;
    setSaving(true);
    try {
      await taskService.create(projectId, { title: taskTitle, description: taskDesc, priority: taskPriority, dueDate: null, assignedUserId: null });
      setPopupVisible(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority(1);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!confirm('Delete this task?')) return;
    await taskService.remove(projectId, taskId);
    await loadData();
  }

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!project) return <div style={{ padding: 32 }}>Project not found.</div>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => router.push('/projects')} style={{
          background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13
        }}>
          ← Back to Projects
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{project.name}</h1>
          <p style={{ color: '#666', fontSize: 14 }}>{project.description}</p>
          <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            Owner: {project.ownerName} · {project.members.length} members
          </p>
        </div>
        <Button text="New Task" type="default" icon="plus" onClick={() => setPopupVisible(true)} />
      </div>

      <DataGrid
        dataSource={tasks}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
        onRowClick={(e) => router.push(`/projects/${projectId}/tasks/${e.data.id}`)}
      >
        <SearchPanel visible />
        <Paging pageSize={10} />
        <Column dataField="title" caption="Title" />
        <Column dataField="priority" caption="Priority" width={100} />
        <Column
          dataField="status"
          caption="Status"
          width={120}
          cellRender={(cell) => (
            <span style={{
              background: STATUS_COLORS[cell.value] ?? '#ccc',
              color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12
            }}>
              {cell.value}
            </span>
          )}
        />
        <Column dataField="assignedUserName" caption="Assigned To" width={140} />
        <Column dataField="dueDate" caption="Due Date" dataType="date" width={110} />
        <Column
          caption=""
          width={70}
          cellRender={(cell) => (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteTask(cell.data.id); }}
              style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 12 }}
            >
              Delete
            </button>
          )}
        />
      </DataGrid>

      <Popup visible={popupVisible} title="New Task" width={420} height="auto" onHiding={() => setPopupVisible(false)} showCloseButton>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Title *</label>
            <TextBox value={taskTitle} onValueChanged={(e) => setTaskTitle(e.value)} width="100%" />
          </div>
          <div>
            <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Description</label>
            <TextArea value={taskDesc} onValueChanged={(e) => setTaskDesc(e.value)} height={80} width="100%" />
          </div>
          <div>
            <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Priority</label>
            <SelectBox
              dataSource={PRIORITY_OPTIONS}
              displayExpr="label"
              valueExpr="value"
              value={taskPriority}
              onValueChanged={(e) => setTaskPriority(e.value)}
              width="100%"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button text="Cancel" onClick={() => setPopupVisible(false)} />
            <Button text={saving ? 'Saving...' : 'Create'} type="default" onClick={handleCreateTask} disabled={saving} />
          </div>
        </div>
      </Popup>
    </div>
  );
}
