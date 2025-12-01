import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataChartService } from './data-chart.service';
import { ArduinoUnit, SensorData } from '../model';
import { ArduinoService } from '../services/arduino.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-data-chart',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-chart.component.html',
  styleUrl: './data-chart.component.scss',
})
export class DataChartComponent implements OnInit, OnDestroy {
  private readonly TEMP_COLOR = 'red';
  private readonly HUM_COLOR = 'blue';
  private readonly CHART_ASPECT_RATIO = 3;

  public chart: Chart | undefined;
  public selectedHost: string | undefined = undefined;
  public hosts: Observable<ArduinoUnit[]> | undefined = undefined;
  public errorMessage: string | undefined;

  public historicalData: SensorData[] = [];
  private service = inject(DataChartService);
  private arduinoService = inject(ArduinoService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.hosts = this.arduinoService.getArduinoList();

    const machineName = 'albert.local';
    const startDate = '2023-08-01T00:00:00Z';
    const endDate = '2025-10-01T00:00:00Z';
    this.service
      .fetchHistoricalData(machineName, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.historicalData = data;
          this.errorMessage = undefined;

          this.chart = new Chart('MyChart', {
            type: 'line',
            data: this.prepareChartData(data, machineName),
            options: { aspectRatio: this.CHART_ASPECT_RATIO },
          });
        },
        error: (error) => {
          this.errorMessage = 'Failed to load sensor data. Please try again.';
          console.error('Error fetching data', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.chart) {
      this.chart.destroy();
    }
  }

  trackByHostId(_index: number, host: ArduinoUnit): number {
    return host.id;
  }

  private formatDate(rawDate: string): string {
    return formatDate(rawDate, 'yyyy-MM-dd HH:mm', 'en-US');
  }

  private prepareChartData(data: SensorData[], machineName: string) {
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
      borderColor: this.TEMP_COLOR,
      fill: false,
      tension: 0.1,
    });

    datasets.push({
      label: `${machineName} Humidity`,
      data: humData,
      borderColor: this.HUM_COLOR,
      fill: false,
      tension: 0.1,
    });

    return { labels: allDates, datasets };
  }
}
