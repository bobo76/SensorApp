import { Routes } from '@angular/router';
import { DataChartComponent } from './data-chart/data-chart.component';
import { ArduinoCurrentValuesComponent } from './arduino-current-values/arduino-current-values.component';
import { ArduinoManagementComponent } from './arduino-management/arduino-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DataChartComponent },
  { path: 'current-values', component: ArduinoCurrentValuesComponent },
  { path: 'management', component: ArduinoManagementComponent }
];
