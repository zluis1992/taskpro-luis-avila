'use client';

import { useCallback, useEffect, useState } from 'react';
import TextArea from 'devextreme-react/text-area';
import Button from 'devextreme-react/button';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import { Comment } from '@/app/core/models/comment.model';
import { commentService } from '@/app/core/services/comment.service';

type Props = {
  taskId: number;
};

function getCurrentUserId(): number {
  if (typeof window === 'undefined') return 0;
  const token = localStorage.getItem('taskpro_token');
  if (!token) return 0;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.sub ?? payload.nameid ?? 0);
  } catch {
    return 0;
  }
}

export function TaskComments({ taskId }: Props) {
  const currentUserId = getCurrentUserId();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const loadComments = useCallback(async () => {
    try {
      const data = await commentService.getByTask(taskId);
      setComments(data);
    } catch { /* noop */ }
  }, [taskId]);

  useEffect(() => { void loadComments(); }, [loadComments]);

  async function handleSend() {
    const content = newContent.trim();
    if (!content) return;
    setSending(true);
    try {
      await commentService.create(taskId, { content });
      setNewContent('');
      await loadComments();
    } finally {
      setSending(false);
    }
  }

  async function handleEdit(commentId: string) {
    const content = editContent.trim();
    if (!content) return;
    await commentService.update(taskId, commentId, { content });
    setEditingId(null);
    await loadComments();
  }

  async function handleDelete(commentId: string) {
    const result = await dxConfirm('¿Eliminar este comentario?', 'Confirmar');
    if (!result) return;
    await commentService.remove(taskId, commentId);
    await loadComments();
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>
        Comentarios ({comments.length})
      </div>

      {/* Lista de comentarios */}
      <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 12 }}>
        {comments.length === 0 && (
          <div style={{ color: '#999', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
            Sin comentarios
          </div>
        )}
        {comments.map((c) => (
          <div key={c.id} style={{
            padding: '10px 12px',
            marginBottom: 8,
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{c.authorName}</span>
                <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>
                  {new Date(c.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {c.updatedAt && ' (editado)'}
                </span>
              </div>
              {c.authorId === currentUserId && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button icon="edit" stylingMode="text" hint="Editar" onClick={() => { setEditingId(c.id); setEditContent(c.content); }} />
                  <Button icon="trash" stylingMode="text" hint="Eliminar" type="danger" onClick={() => void handleDelete(c.id)} />
                </div>
              )}
            </div>
            {editingId === c.id ? (
              <div>
                <TextArea value={editContent} onValueChanged={(e) => setEditContent(e.value as string)} height={60} />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <Button text="Guardar" type="default" stylingMode="contained" onClick={() => void handleEdit(c.id)} />
                  <Button text="Cancelar" stylingMode="outlined" onClick={() => setEditingId(null)} />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#333', whiteSpace: 'pre-wrap' }}>{c.content}</div>
            )}
          </div>
        ))}
      </div>

      {/* Nuevo comentario */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <TextArea
            value={newContent}
            onValueChanged={(e) => setNewContent(e.value as string)}
            height={60}
            placeholder="Escribe un comentario..."
          />
        </div>
        <Button
          icon="send"
          type="default"
          stylingMode="contained"
          disabled={sending || !newContent.trim()}
          onClick={() => void handleSend()}
        />
      </div>
    </div>
  );
}
