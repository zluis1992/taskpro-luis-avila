export type TaskFormData = {
  title: string;
  description: string;
  priority: number;
  status: number;
  dueDate: string | null;
  assignedUserId: number | null;
  projectId: number | null;
};

export const emptyTaskForm = (): TaskFormData => ({
  title: '',
  description: '',
  priority: 1,
  status: 0,
  dueDate: null,
  assignedUserId: null,
  projectId: null,
});
