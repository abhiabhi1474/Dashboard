import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { PerformanceDataService } from '../../../../services/performance-data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trend-chart.component.html',
  styleUrl: './trend-chart.component.css'
})
export class TrendChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  dataService = inject(PerformanceDataService);

  private trendChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;
  chartType: 'line' | 'bar' = 'line';

  constructor() {
    effect(() => {
      const points = this.dataService.chartDataPoints();
      const kpis = this.dataService.dashboardKPIs();
      if (this.trendCanvas && this.donutCanvas) {
        this.updateCharts(points, kpis);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateCharts(this.dataService.chartDataPoints(), this.dataService.dashboardKPIs());
    }, 100);
  }

  setChartType(type: 'line' | 'bar'): void {
    this.chartType = type;
    this.updateCharts(this.dataService.chartDataPoints(), this.dataService.dashboardKPIs());
  }

  private updateCharts(points: any[], kpis: any): void {
    if (!this.trendCanvas?.nativeElement || !this.donutCanvas?.nativeElement) {
      return;
    }

    this.renderTrendChart(points);
    this.renderDonutChart(kpis);
  }

  private renderTrendChart(points: any[]): void {
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
      this.trendChartInstance = null;
    }

    const labels = points.map(p => p.label);
    const totalData = points.map(p => p.total);
    const resolvedData = points.map(p => p.resolved);
    const openData = points.map(p => p.open + p.inProgress);

    const ctx = this.trendCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.trendChartInstance = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Total Tickets Handled',
            data: totalData,
            borderColor: '#6366f1',
            backgroundColor: this.chartType === 'line' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.8)',
            fill: this.chartType === 'line',
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4,
            borderRadius: 6
          },
          {
            label: 'Resolved Successfully',
            data: resolvedData,
            borderColor: '#10b981',
            backgroundColor: this.chartType === 'line' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.8)',
            fill: this.chartType === 'line',
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
            borderRadius: 6
          },
          {
            label: 'Pending / Open Backlog',
            data: openData,
            borderColor: '#f59e0b',
            backgroundColor: this.chartType === 'line' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.8)',
            fill: this.chartType === 'line',
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 4,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.06)'
            },
            ticks: {
              stepSize: 1,
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          }
        }
      }
    });
  }

  private renderDonutChart(kpis: any): void {
    if (this.donutChartInstance) {
      this.donutChartInstance.destroy();
      this.donutChartInstance = null;
    }

    if (!kpis) return;

    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const resolved = kpis.resolvedCount || 0;
    const inProgress = kpis.inProgressCount || 0;
    const open = kpis.openCount || 0;

    this.donutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Resolved', 'In Progress', 'Open / Escalated'],
        datasets: [
          {
            data: [resolved, inProgress, open],
            backgroundColor: [
              '#10b981', // Emerald
              '#06b6d4', // Cyan
              '#f43f5e'  // Rose
            ],
            borderColor: '#111827',
            borderWidth: 3,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10
          }
        },
        cutout: '72%'
      }
    });
  }

  ngOnDestroy(): void {
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }
    if (this.donutChartInstance) {
      this.donutChartInstance.destroy();
    }
  }
}
