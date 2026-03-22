import { emptyTaskForm, TaskFormData } from '@/app/(main)/tasks/types';

describe('tasks types', () => {
  describe('emptyTaskForm', () => {
    it('should return default form values', () => {
      const form = emptyTaskForm();

      expect(form.title).toBe('');
      expect(form.description).toBe('');
      expect(form.priority).toBe(1);
      expect(form.status).toBe(0);
      expect(form.dueDate).toBeNull();
      expect(form.assignedUserId).toBeNull();
      expect(form.projectId).toBeNull();
    });

    it('should return a new object each time', () => {
      const form1 = emptyTaskForm();
      const form2 = emptyTaskForm();
      expect(form1).not.toBe(form2);
    });
  });

  describe('TaskFormData', () => {
    it('should accept valid form data', () => {
      const form: TaskFormData = {
        title: 'Test',
        description: 'Desc',
        priority: 2,
        status: 1,
        dueDate: '2026-12-31',
        assignedUserId: 1,
        projectId: 5,
      };

      expect(form.title).toBe('Test');
      expect(form.projectId).toBe(5);
    });
  });
});
