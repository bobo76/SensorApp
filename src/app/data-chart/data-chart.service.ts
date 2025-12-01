import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SensorData } from '../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataChartService {
  private apiUrl = `${environment.apiUrl}/data/historicalData`;
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
    return this.http.get<SensorData[]>(this.apiUrl, { params });
  }
}
