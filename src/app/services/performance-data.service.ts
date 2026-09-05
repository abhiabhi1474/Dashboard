import { Injectable, signal, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee, EmployeePerformance } from '../models/employee.model';
import { Ticket } from '../models/ticket.model';
import { ChartDataPoint, DashboardKPIs, DateFilterType, DateRange } from '../models/kpi.model';
import employeesJson from '../../assets/data/employees.json';
import ticketsJson from '../../assets/data/tickets.json';

@Injectable({
  providedIn: 'root'
})
export class PerformanceDataService {
  private employees: Employee[] = [];
  private allTickets: Ticket[] = [];

  selectedPeriodType = signal<DateFilterType>('this_week');
  customStartDate = signal<string>(this.formatDate(new Date(Date.now() - 7 * 86400000)));
  customEndDate = signal<string>(this.formatDate(new Date()));

  activeDateRange = signal<DateRange>({
    startDate: this.formatDate(new Date(Date.now() - 7 * 86400000)),
    endDate: this.formatDate(new Date()),
    label: 'This Week'
  });

  dashboardKPIs = signal<DashboardKPIs | null>(null);
  employeePerformance = signal<EmployeePerformance[]>([]);
  chartDataPoints = signal<ChartDataPoint[]>([]);
  activeFilteredTickets = signal<Ticket[]>([]);

  constructor(@Optional() private http?: HttpClient) {
    this.loadDataFromJson();
    this.setPeriod('this_week');


    if (this.http) {
      this.fetchDataFromHttp();
    }
  }


  loadDataFromJson(): void {
    this.employees = (employeesJson as Employee[]).map(e => ({ ...e }));
    const rawTickets = (ticketsJson as Ticket[]).map(t => ({ ...t }));


    const now = new Date();
    const baseTicketDate = rawTickets.length > 0 ? new Date(rawTickets[0].createdAt) : now;
    const diffMs = now.getTime() - baseTicketDate.getTime();
    const dayDiffMs = Math.round(diffMs / 86400000) * 86400000;

    this.allTickets = rawTickets.map(t => {
      const origCreated = new Date(t.createdAt).getTime();
      const adjustedCreated = new Date(origCreated + dayDiffMs).toISOString();

      let adjustedResolved: string | undefined = undefined;
      if (t.resolvedAt) {
        const origResolved = new Date(t.resolvedAt).getTime();
        adjustedResolved = new Date(origResolved + dayDiffMs).toISOString();
      }

      return {
        ...t,
        createdAt: adjustedCreated,
        resolvedAt: adjustedResolved
      };
    });
  }


  fetchDataFromHttp(): void {
    if (!this.http) return;

    this.http.get<Employee[]>('/data/employees.json').subscribe({
      next: (emps) => {
        if (emps && emps.length > 0) {
          this.employees = emps;
          this.recalculateAll(this.activeDateRange());
        }
      },
      error: () => {
      }
    });

    this.http.get<Ticket[]>('/data/tickets.json').subscribe({
      next: (tkts) => {
        if (tkts && tkts.length > 0) {
          const now = new Date();
          const baseTicketDate = new Date(tkts[0].createdAt);
          const diffMs = now.getTime() - baseTicketDate.getTime();
          const dayDiffMs = Math.round(diffMs / 86400000) * 86400000;

          this.allTickets = tkts.map(t => {
            const origCreated = new Date(t.createdAt).getTime();
            const adjustedCreated = new Date(origCreated + dayDiffMs).toISOString();

            let adjustedResolved: string | undefined = undefined;
            if (t.resolvedAt) {
              const origResolved = new Date(t.resolvedAt).getTime();
              adjustedResolved = new Date(origResolved + dayDiffMs).toISOString();
            }

            return {
              ...t,
              createdAt: adjustedCreated,
              resolvedAt: adjustedResolved
            };
          });

          this.recalculateAll(this.activeDateRange());
        }
      },
      error: () => {
      }
    });
  }


  getEmployees(): Employee[] {
    return [...this.employees];
  }

  getAllTickets(): Ticket[] {
    return [...this.allTickets];
  }

  setPeriod(type: DateFilterType): void {
    this.selectedPeriodType.set(type);
    const range = this.computeRangeForType(type);
    this.activeDateRange.set(range);
    this.recalculateAll(range);
  }

  applyCustomRange(startDate: string, endDate: string): { valid: boolean; message?: string } {
    if (!startDate || !endDate) {
      return { valid: false, message: 'Both start date and end date are required.' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, message: 'Invalid calendar date format.' };
    }

    if (start > end) {
      return { valid: false, message: 'End date cannot be prior to the start date.' };
    }

    this.selectedPeriodType.set('custom');
    this.customStartDate.set(startDate);
    this.customEndDate.set(endDate);

    const range: DateRange = {
      startDate,
      endDate,
      label: `Custom (${startDate} to ${endDate})`
    };
    this.activeDateRange.set(range);
    this.recalculateAll(range);

    return { valid: true };
  }

  private computeRangeForType(type: DateFilterType): DateRange {
    const now = new Date();
    const todayStr = this.formatDate(now);

    if (type === 'today') {
      return {
        startDate: todayStr,
        endDate: todayStr,
        label: 'Today'
      };
    }

    if (type === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(now);
      monday.setDate(diff);

      return {
        startDate: this.formatDate(monday),
        endDate: todayStr,
        label: 'This Week'
      };
    }

    if (type === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: this.formatDate(firstDay),
        endDate: todayStr,
        label: 'This Month'
      };
    }

    return {
      startDate: this.customStartDate(),
      endDate: this.customEndDate(),
      label: 'Custom Range'
    };
  }

  private recalculateAll(range: DateRange): void {
    const startIso = `${range.startDate}T00:00:00.000Z`;
    const endIso = `${range.endDate}T23:59:59.999Z`;
    const filtered = this.allTickets.filter(t => {
      const d = t.createdAt;
      return d >= startIso && d <= endIso;
    });

    this.activeFilteredTickets.set(filtered);


    const todayRange = this.computeRangeForType('today');
    const weekRange = this.computeRangeForType('this_week');
    const monthRange = this.computeRangeForType('this_month');

    const countToday = this.allTickets.filter(t => t.createdAt >= `${todayRange.startDate}T00:00:00.000Z` && t.createdAt <= `${todayRange.endDate}T23:59:59.999Z`).length;
    const countWeek = this.allTickets.filter(t => t.createdAt >= `${weekRange.startDate}T00:00:00.000Z` && t.createdAt <= `${weekRange.endDate}T23:59:59.999Z`).length;
    const countMonth = this.allTickets.filter(t => t.createdAt >= `${monthRange.startDate}T00:00:00.000Z` && t.createdAt <= `${monthRange.endDate}T23:59:59.999Z`).length;

    let under1Hour = 0;
    let between1And4Hours = 0;
    let between4And8Hours = 0;
    let over8Hours = 0;
    let totalMinutes = 0;

    filtered.forEach(t => {
      totalMinutes += t.durationMinutes;
      const hours = t.durationMinutes / 60;
      if (hours <= 1) under1Hour++;
      else if (hours <= 4) between1And4Hours++;
      else if (hours <= 8) between4And8Hours++;
      else over8Hours++;
    });
    const empPerformanceMap = new Map<string, EmployeePerformance>();

    this.employees.forEach(emp => {
      empPerformanceMap.set(emp.id, {
        employee: emp,
        totalAssigned: 0,
        totalHandled: 0,
        resolvedCount: 0,
        inProgressCount: 0,
        openCount: 0,
        resolutionRate: 0,
        avgResolutionTimeHours: 0,
        slaAdherenceRate: 0,
        rank: 0,
        tier: 'Good'
      });
    });

    filtered.forEach(t => {
      const perf = empPerformanceMap.get(t.assignedEmployeeId);
      if (perf) {
        perf.totalHandled++;
        perf.totalAssigned++;
        if (t.status === 'RESOLVED') {
          perf.resolvedCount++;
        } else if (t.status === 'IN_PROGRESS') {
          perf.inProgressCount++;
        } else {
          perf.openCount++;
        }
      }
    });

    const perfList: EmployeePerformance[] = [];
    empPerformanceMap.forEach(perf => {
      if (perf.totalHandled > 0) {
        perf.resolutionRate = Math.round((perf.resolvedCount / perf.totalHandled) * 100);
        const withinSla = Math.min(100, Math.round(perf.resolutionRate * 0.95 + 5));
        perf.slaAdherenceRate = withinSla;
        perf.avgResolutionTimeHours = +(perf.employee.targetSlaHours * (1.1 - (perf.resolutionRate / 200))).toFixed(1);
      } else {
        perf.resolutionRate = 0;
        perf.slaAdherenceRate = 100;
        perf.avgResolutionTimeHours = perf.employee.targetSlaHours;
      }

      if (perf.resolutionRate >= 80 && perf.totalHandled >= 2) {
        perf.tier = 'Elite';
      } else if (perf.resolutionRate < 60 || perf.openCount >= 3) {
        perf.tier = 'Needs Coaching';
      } else {
        perf.tier = 'Good';
      }

      perfList.push(perf);
    });

    perfList.sort((a, b) => {
      if (b.resolutionRate !== a.resolutionRate) {
        return b.resolutionRate - a.resolutionRate;
      }
      return b.totalHandled - a.totalHandled;
    });

    perfList.forEach((item, index) => {
      item.rank = index + 1;
    });

    this.employeePerformance.set(perfList);


    const activePerfs = perfList.filter(p => p.totalHandled > 0);
    const bestPerformer = activePerfs.length > 0 ? activePerfs[0] : perfList[0] || null;
    const leastPerformer = activePerfs.length > 0 ? activePerfs[activePerfs.length - 1] : perfList[perfList.length - 1] || null;

    const resolvedCount = filtered.filter(t => t.status === 'RESOLVED').length;
    const inProgressCount = filtered.filter(t => t.status === 'IN_PROGRESS').length;
    const openCount = filtered.filter(t => t.status === 'OPEN').length;
    const overallRate = filtered.length > 0 ? Math.round((resolvedCount / filtered.length) * 100) : 0;
    const avgTicketsPerEmployee = this.employees.length > 0 ? +(filtered.length / this.employees.length).toFixed(1) : 0;


    const deptMap = new Map<string, number>();
    this.employees.forEach(e => {
      deptMap.set(e.department, (deptMap.get(e.department) || 0) + 1);
    });
    const departmentCounts = Array.from(deptMap.entries()).map(([department, count]) => ({ department, count }));

    const kpis: DashboardKPIs = {
      totalEmployeeCount: this.employees.length,
      activeEmployeeCount: perfList.filter(p => p.totalHandled > 0).length,
      departmentCounts,
      bestPerformer,
      leastPerformer,
      totalTicketsHandled: filtered.length,
      avgTicketsPerEmployee,
      slaAdherenceAverage: perfList.length > 0 ? Math.round(perfList.reduce((acc, p) => acc + p.slaAdherenceRate, 0) / perfList.length) : 0,
      totalHoursSpentHandling: Math.round(totalMinutes / 60),
      ticketsCountToday: countToday,
      ticketsCountThisWeek: countWeek,
      ticketsCountThisMonth: countMonth,
      ticketsCountSelectedPeriod: filtered.length,
      resolvedCount,
      inProgressCount,
      openCount,
      overallResolutionRate: overallRate,
      timeDistribution: {
        under1Hour,
        between1And4Hours,
        between4And8Hours,
        over8Hours
      }
    };

    this.dashboardKPIs.set(kpis);


    this.computeChartPoints(range, filtered);
  }

  private computeChartPoints(range: DateRange, filteredTickets: Ticket[]): void {
    const points: ChartDataPoint[] = [];

    if (this.selectedPeriodType() === 'today') {
      const hours = [8, 10, 12, 14, 16, 18, 20];
      hours.forEach(hr => {
        const hrTickets = filteredTickets.filter(t => {
          const tDate = new Date(t.createdAt);
          return tDate.getHours() >= hr && tDate.getHours() < hr + 2;
        });

        points.push({
          label: `${String(hr).padStart(2, '0')}:00`,
          total: hrTickets.length,
          resolved: hrTickets.filter(t => t.status === 'RESOLVED').length,
          inProgress: hrTickets.filter(t => t.status === 'IN_PROGRESS').length,
          open: hrTickets.filter(t => t.status === 'OPEN').length
        });
      });
    } else {

      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      const dayDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);


      const dayGroups = new Map<string, Ticket[]>();
      filteredTickets.forEach(t => {
        const dateKey = t.createdAt.split('T')[0];
        if (!dayGroups.has(dateKey)) {
          dayGroups.set(dateKey, []);
        }
        dayGroups.get(dateKey)!.push(t);
      });

      if (dayDiff <= 14) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = this.formatDate(d);
          const dayTickets = dayGroups.get(key) || [];
          const weekday = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

          points.push({
            label: weekday,
            total: dayTickets.length,
            resolved: dayTickets.filter(t => t.status === 'RESOLVED').length,
            inProgress: dayTickets.filter(t => t.status === 'IN_PROGRESS').length,
            open: dayTickets.filter(t => t.status === 'OPEN').length
          });
        }
      } else {

        const step = Math.ceil(dayDiff / 8);
        for (let i = 0; i < dayDiff; i += step) {
          const chunkStart = new Date(start.getTime() + i * 86400000);
          const chunkEnd = new Date(Math.min(end.getTime(), start.getTime() + (i + step - 1) * 86400000));
          const label = `${chunkStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

          const startIso = `${this.formatDate(chunkStart)}T00:00:00.000Z`;
          const endIso = `${this.formatDate(chunkEnd)}T23:59:59.999Z`;

          const chunkTickets = filteredTickets.filter(t => t.createdAt >= startIso && t.createdAt <= endIso);

          points.push({
            label,
            total: chunkTickets.length,
            resolved: chunkTickets.filter(t => t.status === 'RESOLVED').length,
            inProgress: chunkTickets.filter(t => t.status === 'IN_PROGRESS').length,
            open: chunkTickets.filter(t => t.status === 'OPEN').length
          });
        }
      }
    }

    this.chartDataPoints.set(points);
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
