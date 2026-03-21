import { UpdateUserRequest, User } from '../models/user.model';
import { del, get, put } from './api.service';

export const userService = {
  getAll: () => get<User[]>('/users'),
  getById: (id: number) => get<User>(`/users/${id}`),
  update: (id: number, request: UpdateUserRequest) => put<User>(`/users/${id}`, request),
  remove: (id: number) => del(`/users/${id}`),
};
