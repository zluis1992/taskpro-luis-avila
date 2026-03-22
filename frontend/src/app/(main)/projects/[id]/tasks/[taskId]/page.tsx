'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TextArea from 'devextreme-react/text-area';
import Button from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import LoadPanel from 'devextreme-react/load-panel';
import { TaskItem, UpdateTaskRequest } from '@/app/core/models/task.model';
import { Comment } from '@/app/core/models/comment.model';
import { taskService } from '@/app/core/services/task.service';
import { commentService } from '@/app/core/services/comment.service';
import { authService } from '@/app/core/services/auth.service';

const STATUS_OPTIONS = [
  { value: 0, label: 'Pendiente' },
  { value: 1, label: 'En progreso' },
  { value: 2, label: 'Completada' },
  { value: 3, label: 'Cancelada' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Baja' },
  { value: 1, label: 'Media' },
  { value: 2, label: 'Alta' },
  { value: 3, label: 'Crítica' },
];

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Completed: 'Completada',
  Cancelled: 'Cancelada',
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Crítica',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: '#d97706',
  InProgress: '#3399ff',
  Completed: '#28a745',
  Cancelled: '#dc3545',
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
  const [savingTask, setSavingTask] = useState(false);
  const [status, setStatus] = useState(0);
  const [priority, setPriority] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        taskService.getById(tId),
        commentService.getByTask(tId),
      ]);
      setTask(t);
      setComments(c);
      setStatus(STATUS_OPTIONS.find((s) => s.label === STATUS_LABELS[t.status])?.value ?? 0);
      setPriority(PRIORITY_OPTIONS.find((p) => p.label === PRIORITY_LABELS[t.priority])?.value ?? 1);
    } finally {
      setLoading(false);
    }
  }, [projectId, tId]);

  useEffect(() => { void loadData(); }, [loadData]);

  async function handleSaveTask() {
    if (!task) return;
    setSavingTask(true);
    try {
      const req: UpdateTaskRequest = {
        title: task.title,
        description: task.description,
        status,
        priority,
        dueDate: task.dueDate,
        assignedUserId: task.assignedUserId,
      };
      await taskService.update(tId, req);
      await loadData();
    } finally {
      setSavingTask(false);
    }
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
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) return <LoadPanel visible />;
  if (!task) return <div>Tarea no encontrada.</div>;

  const currentUser = authService.getCurrentUser();
  const statusColor = STATUS_COLORS[task.status] ?? '#64748b';

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Button
          icon="chevronleft"
          text="Proyecto"
          stylingMode="text"
          onClick={() => router.push(`/projects/${projectId}`)}
          style={{ marginLeft: -8 }}
        />
        <span style={{ color: 'var(--tp-text-secondary)' }}>/</span>
        <span className="tp-page-title" style={{ margin: 0 }}>{task.title}</span>
        <span style={{
          display: 'inline-block',
          padding: '2px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: `${statusColor}18`,
          color: statusColor,
          border: `1px solid ${statusColor}40`,
        }}>
          {STATUS_LABELS[task.status] ?? task.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 20 }}>
        {/* Panel izquierdo: detalles y comentarios */}
        <div>
          {/* Descripción */}
          {task.description && (
            <div className="tp-card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tp-text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                Descripción
              </div>
              <div style={{ fontSize: 14, color: 'var(--tp-text)', lineHeight: 1.6 }}>
                {task.description}
              </div>
            </div>
          )}

          {/* Comentarios */}
          <div className="tp-card">
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tp-primary)', marginBottom: 12 }}>
              Comentarios ({comments.length})
            </div>

            {/* Agregar comentario */}
            <div style={{ marginBottom: 16 }}>
              <TextArea
                value={newComment}
                onValueChanged={(e) => setNewComment(e.value)}
                placeholder="Escribe un comentario..."
                height={80}
                width="100%"
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Button
                  text={saving ? 'Publicando...' : 'Publicar comentario'}
                  type="default"
                  icon="message"
                  onClick={() => void handleAddComment()}
                  disabled={saving || !newComment.trim()}
                />
              </div>
            </div>

            {/* Lista de comentarios */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--tp-text-muted)', padding: '24px 0', fontSize: 14 }}>
                Aún no hay comentarios. ¡Sé el primero en comentar!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((comment) => (
                  <div key={comment.id} style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--tp-bg-secondary)',
                    border: '1px solid var(--tp-border-light)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--tp-primary)' }}>
                        {comment.authorName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--tp-text-muted)' }}>
                          {new Date(comment.createdAt).toLocaleString('es-ES')}
                        </span>
                        {comment.authorName === currentUser?.name && (
                          <Button
                            icon="trash"
                            type="danger"
                            stylingMode="text"
                            onClick={() => void handleDeleteComment(comment.id)}
                            hint="Eliminar comentario"
                          />
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--tp-text)', lineHeight: 1.5 }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: atributos y controles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Cambiar estado y prioridad */}
          <div className="tp-card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tp-primary)', marginBottom: 12 }}>
              Actualizar tarea
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)', marginBottom: 4 }}>Estado</div>
              <SelectBox
                dataSource={STATUS_OPTIONS}
                displayExpr="label"
                valueExpr="value"
                value={status}
                onValueChanged={(e) => setStatus(e.value as number)}
                width="100%"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)', marginBottom: 4 }}>Prioridad</div>
              <SelectBox
                dataSource={PRIORITY_OPTIONS}
                displayExpr="label"
                valueExpr="value"
                value={priority}
                onValueChanged={(e) => setPriority(e.value as number)}
                width="100%"
              />
            </div>

            <Button
              text={savingTask ? 'Guardando...' : 'Guardar cambios'}
              type="default"
              icon="save"
              width="100%"
              onClick={() => void handleSaveTask()}
              disabled={savingTask}
            />
          </div>

          {/* Información */}
          <div className="tp-card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tp-primary)', marginBottom: 12 }}>
              Información
            </div>
            <InfoRow label="Asignado a" value={task.assignedUserName ?? 'Sin asignar'} />
            <InfoRow
              label="Fecha de vencimiento"
              value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}
            />
            <InfoRow
              label="Prioridad"
              value={PRIORITY_LABELS[task.priority] ?? task.priority}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--tp-border-light)' }}>
      <span style={{ fontSize: 12, color: 'var(--tp-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--tp-text)' }}>{value}</span>
    </div>
  );
}
