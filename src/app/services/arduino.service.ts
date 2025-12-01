import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArduinoUnit } from '../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArduinoService {
  private apiUrl = `${environment.apiUrl}/arduino/`;
  private http = inject(HttpClient);

  public getArduinoList(): Observable<ArduinoUnit[]> {
    return this.http.get<ArduinoUnit[]>(this.apiUrl);
  }
}
