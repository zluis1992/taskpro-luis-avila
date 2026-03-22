import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/task.model';
import { del, get, post, put } from './api.service';

export const taskService = {
  getAll: () => get<TaskItem[]>('/tasks'),
  getByProject: (projectId: number) => get<TaskItem[]>(`/projects/${projectId}/tasks`),
  getById: (taskId: number) => get<TaskItem>(`/tasks/${taskId}`),
  create: (request: CreateTaskRequest) => post<TaskItem>('/tasks', request),
  update: (taskId: number, request: UpdateTaskRequest) => put<TaskItem>(`/tasks/${taskId}`, request),
  remove: (taskId: number) => del(`/tasks/${taskId}`),
};
