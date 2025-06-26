import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }
}
