import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, interval, takeUntil, switchMap, startWith, catchError, of } from 'rxjs';
import { ArduinoService } from '../services/arduino.service';
import { DataChartService } from '../data-chart/data-chart.service';
import { ArduinoUnit, SensorData } from '../model';

type ArduinoWithCurrentData = {
  unit: ArduinoUnit;
  currentData?: SensorData;
  error?: boolean;
};

@Component({
  selector: 'app-arduino-current-values',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './arduino-current-values.component.html',
  styleUrl: './arduino-current-values.component.scss'
})
export class ArduinoCurrentValuesComponent implements OnInit, OnDestroy {
  private arduinoService = inject(ArduinoService);
  private dataService = inject(DataChartService);
  private destroy$ = new Subject<void>();

  arduinoData: ArduinoWithCurrentData[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    // Fetch data immediately and then every 30 seconds
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.arduinoService.getArduinoList()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (units) => this.fetchCurrentDataForAllUnits(units),
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCurrentDataForAllUnits(units: ArduinoUnit[]): void {
    this.loading = true;
    this.error = false;

    // Handle each request individually so one failure doesn't fail all
    const currentDataRequests = units.map(unit =>
      this.dataService.getCurrentData(unit.hostName).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(currentDataRequests).subscribe({
      next: (dataArray) => {
        this.arduinoData = units.map((unit, index) => ({
          unit,
          currentData: dataArray[index] ?? undefined,
          error: dataArray[index] === null
        }));
        this.loading = false;
      },
      error: () => {
        // If forkJoin fails completely, create entries with error flag
        this.arduinoData = units.map(unit => ({
          unit,
          error: true
        }));
        this.loading = false;
      }
    });
  }
}
