export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: 'Customer Support' | 'Technical Ops' | 'Quality Assurance' | 'Engineering' | 'Customer Success';
  location: string;
  joinDate: string;
  targetSlaHours: number;
}

export interface EmployeePerformance {
  employee: Employee;
  totalAssigned: number;
  totalHandled: number;
  resolvedCount: number;
  inProgressCount: number;
  openCount: number;
  resolutionRate: number; 
  avgResolutionTimeHours: number;
  slaAdherenceRate: number; 
  rank: number;
  tier: 'Elite' | 'Good' | 'Needs Coaching';
}
