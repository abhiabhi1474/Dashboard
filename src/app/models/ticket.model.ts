export type TicketStatus = 'RESOLVED' | 'IN_PROGRESS' | 'OPEN';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Ticket {
  id: string;
  ticketCode: string;
  title: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedEmployeeId: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionTimeHours?: number;
  durationMinutes: number;
  customerSatisfaction?: number;
}
