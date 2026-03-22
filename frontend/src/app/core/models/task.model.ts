export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  createdAt: string;
}

export interface CreateTaskRequest {
  projectId: number;
  title: string;
  description: string;
  priority: number;
  dueDate: string | null;
  assignedUserId: number | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate: string | null;
  assignedUserId: number | null;
}
