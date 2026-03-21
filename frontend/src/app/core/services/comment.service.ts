import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../models/comment.model';
import { del, get, post, put } from './api.service';

export const commentService = {
  getByTask: (taskId: number) => get<Comment[]>(`/tasks/${taskId}/comments`),
  create: (taskId: number, request: CreateCommentRequest) => post<Comment>(`/tasks/${taskId}/comments`, request),
  update: (taskId: number, commentId: string, request: UpdateCommentRequest) =>
    put<Comment>(`/tasks/${taskId}/comments/${commentId}`, request),
  remove: (taskId: number, commentId: string) => del(`/tasks/${taskId}/comments/${commentId}`),
};
