import { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';
import { del, get, post, put } from './api.service';

export const userService = {
  getAll: () => get<User[]>('/users'),
  getById: (id: number) => get<User>(`/users/${id}`),
  create: (request: CreateUserRequest) => post<User>('/users', request),
  update: (id: number, request: UpdateUserRequest) => put<User>(`/users/${id}`, request),
  remove: (id: number) => del(`/users/${id}`),
};
