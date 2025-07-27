import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  verified: boolean;
  cvUrl?: string | null;
  avatarUrl?: string | null;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** ✅ Lấy danh sách tất cả người dùng (admin) */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`, {
      headers: this.getAuthHeaders()
    });
  }

  /** ✅ Lấy thông tin user hiện tại */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  /** ✅ Cập nhật thông tin người dùng với FormData (ảnh/avatar) */
  updateUserWithForm(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  /** ✅ Cập nhật thông tin người dùng với JSON */
  updateUserJson(id: number, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  /** ✅ Xóa người dùng */
  deleteUserById(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
