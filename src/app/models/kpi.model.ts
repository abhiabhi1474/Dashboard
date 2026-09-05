import { EmployeePerformance } from './employee.model';

export type DateFilterType = 'today' | 'this_week' | 'this_month' | 'custom';

export interface DateRange {
  startDate: string; 
  endDate: string;  
  label: string;
}

export interface DashboardKPIs {
  totalEmployeeCount: number;
  activeEmployeeCount: number;
  departmentCounts: { department: string; count: number }[];

  bestPerformer: EmployeePerformance | null;
  leastPerformer: EmployeePerformance | null;

  totalTicketsHandled: number;
  avgTicketsPerEmployee: number;
  slaAdherenceAverage: number;
  totalHoursSpentHandling: number;

  ticketsCountToday: number;
  ticketsCountThisWeek: number;
  ticketsCountThisMonth: number;
  ticketsCountSelectedPeriod: number;
  
  resolvedCount: number;
  inProgressCount: number;
  openCount: number;
  overallResolutionRate: number;

  timeDistribution: {
    under1Hour: number;
    between1And4Hours: number;
    between4And8Hours: number;
    over8Hours: number;
  };
}

export interface ChartDataPoint {
  label: string;
  total: number;
  resolved: number;
  inProgress: number;
  open: number;
}
