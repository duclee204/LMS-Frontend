import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, data);
  }

  register(data: { username: string; password: string; email: string; fullName: string; role: string }): Observable<any> {
    return this.http.post('http://localhost:8080/api/users/register', data);
  }
}
