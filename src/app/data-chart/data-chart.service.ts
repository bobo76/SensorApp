import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SensorData } from '../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataChartService {
  private historicalDataUrl = `${environment.apiUrl}/data/historicalData`;
  private currentDataUrl = `${environment.apiUrl}/data/current`;
  private http = inject(HttpClient);

  public fetchHistoricalData(
    machineName: string,
    startDate: string,
    endDate: string
  ): Observable<SensorData[]> {
    const params = new HttpParams()
      .set('machineName', machineName)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<SensorData[]>(this.historicalDataUrl, { params });
  }

  public getCurrentData(machineName: string): Observable<SensorData> {
    const params = new HttpParams().set('machineName', machineName);
    return this.http.get<SensorData>(this.currentDataUrl, { params });
  }
}
