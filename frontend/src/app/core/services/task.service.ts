import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/task.model';
import { del, get, post, put } from './api.service';

export const taskService = {
  getByProject: (projectId: number) => get<TaskItem[]>(`/projects/${projectId}/tasks`),
  getById: (projectId: number, taskId: number) => get<TaskItem>(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId: number, request: CreateTaskRequest) => post<TaskItem>(`/projects/${projectId}/tasks`, request),
  update: (projectId: number, taskId: number, request: UpdateTaskRequest) =>
    put<TaskItem>(`/projects/${projectId}/tasks/${taskId}`, request),
  remove: (projectId: number, taskId: number) => del(`/projects/${projectId}/tasks/${taskId}`),
};
