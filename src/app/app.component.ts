import { Component } from '@angular/core';
import { DataChartComponent } from './data-chart/data-chart.component';

@Component({
  selector: 'app-root',
  imports: [DataChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'room-sensors-app';
}
