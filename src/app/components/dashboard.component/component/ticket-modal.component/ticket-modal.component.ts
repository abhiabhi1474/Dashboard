import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceDataService } from '../../../../services/performance-data.service';
import { Ticket } from '../../../../models/ticket.model';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent {
  @Input() employeeId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();

  dataService = inject(PerformanceDataService);

  get employee(): Employee | undefined {
    return this.dataService.getEmployees().find(e => e.id === this.employeeId);
  }

  get employeeTickets(): Ticket[] {
    if (!this.employeeId) return [];
    return this.dataService.activeFilteredTickets().filter(t => t.assignedEmployeeId === this.employeeId);
  }

  get activeRangeLabel(): string {
    return this.dataService.activeDateRange().label;
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
