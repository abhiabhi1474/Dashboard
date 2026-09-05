import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceDataService } from '../../../../services/performance-data.service';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.css'
})
export class KpiCardComponent {
  dataService = inject(PerformanceDataService);

  get kpis() {
    return this.dataService.dashboardKPIs();
  }

  get activeRangeLabel(): string {
    return this.dataService.activeDateRange().label;
  }
}
