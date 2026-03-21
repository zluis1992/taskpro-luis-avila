'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SelectBox from 'devextreme-react/select-box';
import TextArea from 'devextreme-react/text-area';
import Button from 'devextreme-react/button';
import { TaskItem, UpdateTaskRequest } from '@/app/core/models/task.model';
import { Comment } from '@/app/core/models/comment.model';
import { taskService } from '@/app/core/services/task.service';
import { commentService } from '@/app/core/services/comment.service';
import { authService } from '@/app/core/services/auth.service';

const STATUS_OPTIONS = [
  { value: 0, label: 'Pending' }, { value: 1, label: 'InProgress' },
  { value: 2, label: 'Completed' }, { value: 3, label: 'Cancelled' }
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low' }, { value: 1, label: 'Medium' },
  { value: 2, label: 'High' }, { value: 3, label: 'Critical' }
];

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b', InProgress: '#3b82f6', Completed: '#10b981', Cancelled: '#ef4444'
};

export default function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const router = useRouter();
  const projectId = Number(id);
  const tId = Number(taskId);

  const [task, setTask] = useState<TaskItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(0);
  const [priority, setPriority] = useState(1);

  async function loadData() {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        taskService.getById(projectId, tId),
        commentService.getByTask(tId)
      ]);
      setTask(t);
      setComments(c);
      setStatus(STATUS_OPTIONS.find((s) => s.label === t.status)?.value ?? 0);
      setPriority(PRIORITY_OPTIONS.find((p) => p.label === t.priority)?.value ?? 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [projectId, tId]);

  async function handleStatusUpdate() {
    if (!task) return;
    const req: UpdateTaskRequest = {
      title: task.title, description: task.description,
      status, priority, dueDate: task.dueDate, assignedUserId: task.assignedUserId
    };
    await taskService.update(projectId, tId, req);
    await loadData();
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setSaving(true);
    try {
      await commentService.create(tId, { content: newComment });
      setNewComment('');
      const updated = await commentService.getByTask(tId);
      setComments(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    await commentService.remove(tId, commentId);
    setComments(comments.filter((c) => c.id !== commentId));
  }

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!task) return <div style={{ padding: 32 }}>Task not found.</div>;

  const currentUser = authService.getCurrentUser();

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <button onClick={() => router.push(`/projects/${projectId}`)} style={{
        background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13, marginBottom: 16
      }}>
        ← Back to Project
      </button>

      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>{task.title}</h1>
          <span style={{
            background: STATUS_COLORS[task.status] ?? '#ccc',
            color: '#fff', padding: '4px 12px', borderRadius: 12, fontSize: 13
          }}>
            {task.status}
          </span>
        </div>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>{task.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Status</label>
            <SelectBox dataSource={STATUS_OPTIONS} displayExpr="label" valueExpr="value" value={status} onValueChanged={(e) => setStatus(e.value)} width="100%" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Priority</label>
            <SelectBox dataSource={PRIORITY_OPTIONS} displayExpr="label" valueExpr="value" value={priority} onValueChanged={(e) => setPriority(e.value)} width="100%" />
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Assigned to: <strong>{task.assignedUserName ?? 'Unassigned'}</strong>
          {task.dueDate && <> · Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></>}
        </div>
        <Button text="Save Changes" type="default" onClick={handleStatusUpdate} />
      </div>

      {/* Comments */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          Comments ({comments.length})
        </h2>

        <div style={{ marginBottom: 20 }}>
          <TextArea
            value={newComment}
            onValueChanged={(e) => setNewComment(e.value)}
            placeholder="Write a comment..."
            height={80}
            width="100%"
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button text={saving ? 'Posting...' : 'Post Comment'} type="default" onClick={handleAddComment} disabled={saving} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{
              borderLeft: '3px solid #3b82f6', paddingLeft: 16, paddingTop: 4, paddingBottom: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <strong style={{ fontSize: 13 }}>{comment.authorName}</strong>
                  <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                {comment.authorName === currentUser?.name && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 12 }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p style={{ fontSize: 14, color: '#444' }}>{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ color: '#888', fontSize: 14 }}>No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
