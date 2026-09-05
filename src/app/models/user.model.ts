export interface User {
  id: string;
  name: string;
  email: string;
  role: 'System Administrator' | 'Operations Lead' | 'Staff Evaluator';
  avatar: string;
  department: string;
  notificationsCount: number;
}
