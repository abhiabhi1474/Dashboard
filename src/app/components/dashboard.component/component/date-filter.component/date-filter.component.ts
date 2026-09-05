import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceDataService } from '../../../../services/performance-data.service';
import { DateFilterType } from '../../../../models/kpi.model';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.css'
})
export class DateFilterComponent {
  dataService = inject(PerformanceDataService);

  customStart = this.dataService.customStartDate();
  customEnd = this.dataService.customEndDate();
  showCustomInputs = false;
  validationError = '';

  selectPeriod(type: DateFilterType): void {
    this.validationError = '';
    if (type === 'custom') {
      this.showCustomInputs = true;
    } else {
      this.showCustomInputs = false;
      this.dataService.setPeriod(type);
    }
  }

  toggleCustom(): void {
    this.showCustomInputs = !this.showCustomInputs;
    if (this.showCustomInputs) {
      this.validationError = '';
    }
  }

  applyCustom(): void {
    this.validationError = '';
    const result = this.dataService.applyCustomRange(this.customStart, this.customEnd);
    if (!result.valid) {
      this.validationError = result.message || 'Invalid date range.';
    }
  }

  get activeRangeLabel(): string {
    return this.dataService.activeDateRange().label;
  }

  get selectedType(): DateFilterType {
    return this.dataService.selectedPeriodType();
  }
}
