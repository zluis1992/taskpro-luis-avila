export const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Completed: 'Completada',
  Cancelled: 'Cancelada',
};

export const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Crítica',
};

export const STATUS_COLORS: Record<string, string> = {
  Pending: '#d97706',
  InProgress: '#3399ff',
  Completed: '#28a745',
  Cancelled: '#dc3545',
};

export const PRIORITY_OPTIONS = [
  { value: 0, label: 'Baja' },
  { value: 1, label: 'Media' },
  { value: 2, label: 'Alta' },
  { value: 3, label: 'Crítica' },
];

export const STATUS_OPTIONS = [
  { value: 0, label: 'Pendiente' },
  { value: 1, label: 'En progreso' },
  { value: 2, label: 'Completada' },
  { value: 3, label: 'Cancelada' },
];
