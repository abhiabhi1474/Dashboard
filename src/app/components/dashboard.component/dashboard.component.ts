import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerformanceDataService } from '../../services/performance-data.service';
import { Ticket } from '../../models/ticket.model';
import { Employee } from '../../models/employee.model';
import { DateFilterComponent } from './component/date-filter.component/date-filter.component';
import { KpiCardComponent } from './component/kpi-card.component/kpi-card.component';
import { TrendChartComponent } from './component/trend-chart.component/trend-chart.component';
import { EmployeeTableComponent } from './component/employee-table.component/employee-table.component';
import { TicketModalComponent } from './component/ticket-modal.component/ticket-modal.component';

export type DashboardView = 'dashboard' | 'employees' | 'tickets' | 'reports' | 'settings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DateFilterComponent,
    KpiCardComponent,
    TrendChartComponent,
    EmployeeTableComponent,
    TicketModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  authService = inject(AuthService);
  dataService = inject(PerformanceDataService);
  router = inject(Router);

  currentView = signal<DashboardView>('dashboard');
  isSidebarCollapsed = signal<boolean>(false);
  isLightMode = signal<boolean>(false);
  showNotifications = signal<boolean>(false);


  selectedEmployeeForModal = signal<string | null>(null);


  ticketSearch = '';
  ticketStatusFilter = 'ALL';
  ticketPriorityFilter = 'ALL';

  employeeDirectorySearch = '';
  employeeDirectoryDept = 'ALL';

  notifications = [
    { id: 1, title: 'Evaluation Cycle Q3 Active', time: '10m ago', unread: true },
    { id: 2, title: 'Marcus Sterling reached 95% SLA', time: '1h ago', unread: true },
    { id: 3, title: 'SLA target updated for DevOps', time: '3h ago', unread: false }
  ];

  get currentUser() {
    return this.authService.currentUser();
  }

  get employeesList(): Employee[] {
    const q = this.employeeDirectorySearch.toLowerCase().trim();
    return this.dataService.getEmployees().filter(e => {
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
      const matchDept = this.employeeDirectoryDept === 'ALL' || e.department === this.employeeDirectoryDept;
      return matchQ && matchDept;
    });
  }

  get ticketsExplorerList(): Ticket[] {
    const q = this.ticketSearch.toLowerCase().trim();
    return this.dataService.activeFilteredTickets().filter(t => {
      const matchQ = !q || t.ticketCode.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchStatus = this.ticketStatusFilter === 'ALL' || t.status === this.ticketStatusFilter;
      const matchPriority = this.ticketPriorityFilter === 'ALL' || t.priority === this.ticketPriorityFilter;
      return matchQ && matchStatus && matchPriority;
    });
  }

  setView(view: DashboardView): void {
    this.currentView.set(view);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  toggleTheme(): void {
    this.isLightMode.set(!this.isLightMode());
    if (this.isLightMode()) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }

  openTicketModal(employeeId: string): void {
    this.selectedEmployeeForModal.set(employeeId);
  }

  closeTicketModal(): void {
    this.selectedEmployeeForModal.set(null);
  }

  logout(): void {
    this.authService.logout();
  }

  exportReportCSV(): void {
    const performances = this.dataService.employeePerformance();
    const range = this.dataService.activeDateRange();

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `PerformPulse Evaluation Report - Period: ${range.label}\n`;
    csvContent += `Rank,Name,Email,Department,Handled,Resolved,InProgress,Open,ResolutionRate(%),SLACompliance(%),EvaluationTier\n`;

    performances.forEach(p => {
      const row = [
        p.rank,
        `"${p.employee.name}"`,
        `"${p.employee.email}"`,
        `"${p.employee.department}"`,
        p.totalHandled,
        p.resolvedCount,
        p.inProgressCount,
        p.openCount,
        `${p.resolutionRate}%`,
        `${p.slaAdherenceRate}%`,
        `"${p.tier}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `performance_evaluation_${range.startDate}_to_${range.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
