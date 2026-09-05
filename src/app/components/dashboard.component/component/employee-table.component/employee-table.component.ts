import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceDataService } from '../../../../services/performance-data.service';
import { EmployeePerformance } from '../../../../models/employee.model';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-table.component.html',
  styleUrl: './employee-table.component.css'
})
export class EmployeeTableComponent {
  dataService = inject(PerformanceDataService);

  @Output() viewEmployeeTickets = new EventEmitter<string>();

  searchQuery = '';
  selectedDepartment = 'ALL';
  sortColumn: 'rank' | 'rate' | 'handled' = 'rank';
  sortAsc = true;

  departments = ['ALL', 'Customer Support', 'Technical Ops', 'Quality Assurance', 'Engineering', 'Customer Success'];

  get filteredEmployees(): EmployeePerformance[] {
    const list = this.dataService.employeePerformance();
    const q = this.searchQuery.toLowerCase().trim();

    return list
      .filter(item => {
        const matchesQuery =
          !q ||
          item.employee.name.toLowerCase().includes(q) ||
          item.employee.email.toLowerCase().includes(q) ||
          item.employee.department.toLowerCase().includes(q);

        const matchesDept =
          this.selectedDepartment === 'ALL' || item.employee.department === this.selectedDepartment;

        return matchesQuery && matchesDept;
      })
      .sort((a, b) => {
        let valA: number;
        let valB: number;

        if (this.sortColumn === 'rank') {
          valA = a.rank;
          valB = b.rank;
        } else if (this.sortColumn === 'rate') {
          valA = a.resolutionRate;
          valB = b.resolutionRate;
        } else {
          valA = a.totalHandled;
          valB = b.totalHandled;
        }

        return this.sortAsc ? valA - valB : valB - valA;
      });
  }

  toggleSort(col: 'rank' | 'rate' | 'handled'): void {
    if (this.sortColumn === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = col;
      this.sortAsc = col === 'rank'; 
    }
  }

  inspectTickets(employeeId: string): void {
    this.viewEmployeeTickets.emit(employeeId);
  }
}
