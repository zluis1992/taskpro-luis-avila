import { User } from './user.model';

export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  members: User[];
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
}
