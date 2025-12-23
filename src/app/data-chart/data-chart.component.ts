import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Chart, PointPrefixedHoverOptions } from 'chart.js/auto';
import { DataChartService } from './data-chart.service';
import { ArduinoUnit, SensorData } from '../model';
import { ArduinoService } from '../services/arduino.service';
import { ThemeService } from '../services/theme.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-data-chart',
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './data-chart.component.html',
  styleUrl: './data-chart.component.scss',
})
export class DataChartComponent implements OnInit, OnDestroy {
  private readonly CHART_ASPECT_RATIO = this.getResponsiveAspectRatio();

  // Theme-aware colors
  private readonly LIGHT_MODE_COLORS = {
    temperature: '#ef4444', // red-500
    humidity: '#3b82f6', // blue-500
    grid: '#e5e7eb', // gray-200
    text: '#6b7280', // gray-500
  };

  private readonly DARK_MODE_COLORS = {
    temperature: '#f87171', // red-400 (brighter for dark bg)
    humidity: '#60a5fa', // blue-400 (brighter for dark bg)
    grid: '#374151', // gray-700
    text: '#9ca3af', // gray-400
  };

  public chart: Chart | undefined;
  public selectedHost: string | undefined = undefined;
  public hosts: Observable<ArduinoUnit[]> | undefined = undefined;
  public errorMessage: string | undefined;
  public isLoading: boolean = false;
  public startDate: Date;
  public endDate: Date;
  public activePreset: string | null = null;

  public historicalData: SensorData[] = [];
  public currentTemperature: number | undefined;
  public currentHumidity: number | undefined;
  public lastUpdated: string | undefined;
  private service = inject(DataChartService);
  private arduinoService = inject(ArduinoService);
  private themeService = inject(ThemeService);
  private destroy$ = new Subject<void>();
  private isDarkMode: boolean = false;
  private resizeHandler = this.onWindowResize.bind(this);

  constructor() {
    // Set end date to today
    this.endDate = new Date();

    // Set start date to 2 weeks ago
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 14);
  }

  ngOnInit(): void {
    this.hosts = this.arduinoService.getArduinoList();

    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDarkMode = isDark;
        // Update chart colors when theme changes
        if (this.chart) {
          this.updateChartColors();
        }
      });

    // Handle window resize for responsive chart
    window.addEventListener('resize', this.resizeHandler);

    // Set initial host
    this.selectedHost = 'albert.local';
    this.loadChartData(this.selectedHost);
  }

  private onWindowResize(): void {
    if (this.chart && this.chart.options) {
      const newAspectRatio = this.getResponsiveAspectRatio();
      this.chart.options.aspectRatio = newAspectRatio;
      this.chart.resize();
    }
  }

  onHostChange(hostName: string): void {
    if (hostName) {
      this.loadChartData(hostName);
    }
  }

  onDateChange(): void {
    // Clear active preset when manually changing dates
    this.activePreset = null;

    if (this.selectedHost && this.startDate && this.endDate) {
      this.loadChartData(this.selectedHost);
    }
  }

  applyPreset(preset: string | null): void {
    if (!preset) return;

    // Calculate start and end dates based on preset
    switch (preset) {
      case '24h':
        // Set to today from 00:00 to 24:00 (midnight to midnight)
        this.startDate = new Date();
        this.startDate.setHours(0, 0, 0, 0);
        this.endDate = new Date();
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case '7d':
        this.endDate = new Date();
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 7);
        break;
      case '30d':
        this.endDate = new Date();
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 30);
        break;
      case '90d':
        this.endDate = new Date();
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 90);
        break;
      default:
        return;
    }

    // Reload chart data with new date range
    if (this.selectedHost) {
      this.loadChartData(this.selectedHost);
    }
  }

  navigateDateRange(direction: 'previous' | 'next'): void {
    // Clear active preset when navigating
    this.activePreset = null;

    // Calculate the number of days between start and end
    const daysDifference = Math.ceil(
      (this.endDate.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Shift both dates by the same interval
    const multiplier = direction === 'next' ? 1 : -1;

    this.startDate = new Date(this.startDate);
    this.startDate.setDate(
      this.startDate.getDate() + daysDifference * multiplier
    );

    this.endDate = new Date(this.endDate);
    this.endDate.setDate(this.endDate.getDate() + daysDifference * multiplier);

    // Reload chart data with new date range
    if (this.selectedHost) {
      this.loadChartData(this.selectedHost);
    }
  }

  private getThemeColors() {
    return this.isDarkMode ? this.DARK_MODE_COLORS : this.LIGHT_MODE_COLORS;
  }

  private getResponsiveAspectRatio(): number {
    const width = window.innerWidth;
    if (width <= 480) {
      return 1.5; // More square on mobile
    } else if (width <= 768) {
      return 2; // Moderate ratio on tablets
    }
    return 3; // Wide ratio on desktop
  }

  private updateChartColors(): void {
    if (!this.chart || !this.selectedHost) return;

    const colors = this.getThemeColors();

    // Update dataset colors
    if (this.chart.data.datasets[0]) {
      this.chart.data.datasets[0].borderColor = colors.temperature;
      this.chart.data.datasets[0].backgroundColor = colors.temperature;
      (
        this.chart.data.datasets[0] as PointPrefixedHoverOptions
      ).pointHoverBackgroundColor = colors.temperature;
    }
    if (this.chart.data.datasets[1]) {
      this.chart.data.datasets[1].borderColor = colors.humidity;
      this.chart.data.datasets[1].backgroundColor = colors.humidity;
      (
        this.chart.data.datasets[1] as PointPrefixedHoverOptions
      ).pointHoverBackgroundColor = colors.humidity;
    }

    // Update grid and text colors
    if (this.chart.options.scales) {
      const scaleOptions = {
        grid: { color: colors.grid },
        ticks: { color: colors.text },
      };

      if (this.chart.options.scales['x']) {
        this.chart.options.scales['x'].grid = scaleOptions.grid;
        this.chart.options.scales['x'].ticks = scaleOptions.ticks;
      }
      if (this.chart.options.scales['y']) {
        this.chart.options.scales['y'].grid = scaleOptions.grid;
        this.chart.options.scales['y'].ticks = scaleOptions.ticks;
      }
    }

    // Update legend text color
    if (this.chart.options.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = colors.text;
    }

    this.chart.update();
  }

  private loadChartData(machineName: string): void {
    const startDateStr = this.startDate.toISOString();
    const endDateStr = this.endDate.toISOString();

    this.isLoading = true;
    this.errorMessage = undefined;

    this.service
      .fetchHistoricalData(machineName, startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.historicalData = data;
          this.isLoading = false;

          // Extract latest values (last item in array)
          if (data.length > 0) {
            const latestReading = data[data.length - 1];
            const temp = Number(latestReading.temperature);
            const hum = Number(latestReading.humidity);

            this.currentTemperature = isNaN(temp) ? undefined : temp;
            this.currentHumidity = isNaN(hum) ? undefined : hum;
            this.lastUpdated = latestReading.creationDate;
          } else {
            this.currentTemperature = undefined;
            this.currentHumidity = undefined;
            this.lastUpdated = undefined;
          }

          // Destroy existing chart before creating a new one
          if (this.chart) {
            this.chart.destroy();
          }

          const colors = this.getThemeColors();

          this.chart = new Chart('MyChart', {
            type: 'line',
            data: this.prepareChartData(data, machineName),
            options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: this.getResponsiveAspectRatio(),
              scales: {
                x: {
                  grid: { color: colors.grid },
                  ticks: {
                    color: colors.text,
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: window.innerWidth <= 480 ? 6 : 10,
                  },
                },
                y: {
                  grid: { color: colors.grid },
                  ticks: { color: colors.text },
                },
              },
              plugins: {
                legend: {
                  labels: {
                    color: colors.text,
                    boxWidth: window.innerWidth <= 480 ? 30 : 40,
                    font: {
                      size: window.innerWidth <= 480 ? 11 : 12,
                    },
                  },
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false,
              },
            },
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load sensor data. Please try again.';
          console.error('Error fetching data', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Remove resize listener
    window.removeEventListener('resize', this.resizeHandler);

    if (this.chart) {
      this.chart.destroy();
    }
  }

  trackByHostId(_index: number, host: ArduinoUnit): number {
    return host.id;
  }

  formatLastUpdated(): string {
    if (!this.lastUpdated) return '';
    const date = new Date(this.lastUpdated);
    return formatDate(date, 'MMM d, y, h:mm a', 'en-US');
  }

  private formatDate(rawDate: string): string {
    // Calculate the time range in hours
    const rangeInHours = Math.abs(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60)
    );

    // For 24h or less: show time only in HH:mm format
    if (rangeInHours <= 24) {
      return formatDate(rawDate, 'HH:mm', 'en-US');
    }
    // For longer ranges: show date only without hours
    return formatDate(rawDate, 'yyyy-MM-dd', 'en-US');
  }

  private prepareChartData(data: SensorData[], machineName: string) {
    const colors = this.getThemeColors();

    // Calculate the time range in hours to determine line tension
    const rangeInHours = Math.abs(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60)
    );
    // For 24h or less: use straight lines (no smoothing)
    // For longer ranges: use smooth curves
    const lineTension = rangeInHours <= 24 ? 0 : 0.4;

    // Create maps from formatted date to value for temperature and humidity
    const tempMap = new Map<string, number>();
    const humMap = new Map<string, number>();

    data.forEach((d) => {
      const formattedDate = this.formatDate(d.creationDate);
      tempMap.set(formattedDate, d.temperature);
      humMap.set(formattedDate, d.humidity);
    });

    // Let's extract all unique sorted date labels across all machines first
    const allDatesSet = new Set<string>();
    data.forEach((d) => allDatesSet.add(this.formatDate(d.creationDate)));
    const allDates = Array.from(allDatesSet).sort();

    // Build the dataset arrays aligned to allDates (put null if no data for that date)
    const tempData = allDates.map((date) => tempMap.get(date) ?? null);
    const humData = allDates.map((date) => humMap.get(date) ?? null);

    const datasets = [];
    datasets.push({
      label: `${machineName} Temperature`,
      data: tempData,
      borderColor: colors.temperature,
      backgroundColor: colors.temperature,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: colors.temperature,
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
      fill: false,
      tension: lineTension,
      spanGaps: false,
    });

    datasets.push({
      label: `${machineName} Humidity`,
      data: humData,
      borderColor: colors.humidity,
      backgroundColor: colors.humidity,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: colors.humidity,
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
      fill: false,
      tension: lineTension,
    });

    return { labels: allDates, datasets };
  }
}
