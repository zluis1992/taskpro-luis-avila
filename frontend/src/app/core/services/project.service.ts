import { CreateProjectRequest, Project, UpdateProjectRequest } from '../models/project.model';
import { del, get, post, put } from './api.service';

export const projectService = {
  getAll: () => get<Project[]>('/projects'),
  create: (request: CreateProjectRequest) => post<Project>('/projects', request),
  update: (id: number, request: UpdateProjectRequest) => put<Project>(`/projects/${id}`, request),
  remove: (id: number) => del(`/projects/${id}`),
};
