import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/app/(main)/tasks/constants';

describe('tasks constants', () => {
  describe('STATUS_LABELS', () => {
    it('should have labels for all statuses', () => {
      expect(STATUS_LABELS['Pending']).toBe('Pendiente');
      expect(STATUS_LABELS['InProgress']).toBe('En progreso');
      expect(STATUS_LABELS['Completed']).toBe('Completada');
      expect(STATUS_LABELS['Cancelled']).toBe('Cancelada');
    });
  });

  describe('STATUS_COLORS', () => {
    it('should have colors for all statuses', () => {
      expect(STATUS_COLORS['Pending']).toBeTruthy();
      expect(STATUS_COLORS['InProgress']).toBeTruthy();
      expect(STATUS_COLORS['Completed']).toBeTruthy();
      expect(STATUS_COLORS['Cancelled']).toBeTruthy();
    });
  });

  describe('PRIORITY_LABELS', () => {
    it('should have labels for all priorities', () => {
      expect(PRIORITY_LABELS['Low']).toBe('Baja');
      expect(PRIORITY_LABELS['Medium']).toBe('Media');
      expect(PRIORITY_LABELS['High']).toBe('Alta');
      expect(PRIORITY_LABELS['Critical']).toBe('Crítica');
    });
  });

  describe('PRIORITY_OPTIONS', () => {
    it('should have 4 options', () => {
      expect(PRIORITY_OPTIONS).toHaveLength(4);
    });

    it('should have correct values and labels', () => {
      expect(PRIORITY_OPTIONS[0]).toEqual({ value: 0, label: 'Baja' });
      expect(PRIORITY_OPTIONS[3]).toEqual({ value: 3, label: 'Crítica' });
    });
  });

  describe('STATUS_OPTIONS', () => {
    it('should have 4 options', () => {
      expect(STATUS_OPTIONS).toHaveLength(4);
    });

    it('should have correct values and labels', () => {
      expect(STATUS_OPTIONS[0]).toEqual({ value: 0, label: 'Pendiente' });
      expect(STATUS_OPTIONS[2]).toEqual({ value: 2, label: 'Completada' });
    });
  });
});
