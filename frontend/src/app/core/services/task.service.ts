import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/task.model';
import { del, get, post, put } from './api.service';

export const taskService = {
  getAll: () => get<TaskItem[]>('/tasks'),
  getByProject: async (projectId: number) => {
    const all = await get<TaskItem[]>('/tasks');
    return all.filter((t) => t.projectId === projectId);
  },
  getById: (taskId: number) => get<TaskItem>(`/tasks/${taskId}`),
  create: (request: CreateTaskRequest) => post<TaskItem>('/tasks', request),
  update: (taskId: number, request: UpdateTaskRequest) => put<TaskItem>(`/tasks/${taskId}`, request),
  remove: (taskId: number) => del(`/tasks/${taskId}`),
};
