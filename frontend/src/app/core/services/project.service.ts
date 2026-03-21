import { CreateProjectRequest, Project, UpdateProjectRequest } from '../models/project.model';
import { User } from '../models/user.model';
import { del, get, post, put } from './api.service';

export const projectService = {
  getAll: () => get<Project[]>('/projects'),
  getById: (id: number) => get<Project>(`/projects/${id}`),
  create: (request: CreateProjectRequest) => post<Project>('/projects', request),
  update: (id: number, request: UpdateProjectRequest) => put<Project>(`/projects/${id}`, request),
  remove: (id: number) => del(`/projects/${id}`),
  getMembers: (id: number) => get<User[]>(`/projects/${id}/members`),
  addMember: (projectId: number, userId: number) => post(`/projects/${projectId}/members/${userId}`),
  removeMember: (projectId: number, userId: number) => del(`/projects/${projectId}/members/${userId}`),
};
