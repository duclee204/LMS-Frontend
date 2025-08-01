import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  verified: boolean;
  cvUrl?: string | null;
  avatarUrl?: string | null; // ✅ thêm avatarUrl để hiển thị ảnh
  password?: string; // tùy chọn khi cập nhật
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://lms-backend001-9bfc04222cdc.herokuapp.com/api/users';

  constructor(private http: HttpClient) {}

  // ✅ Lấy danh sách người dùng
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }

  // ✅ Cập nhật người dùng với FormData (kèm file avatar)
  updateUserWithForm(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, formData);
  }

  // (Optional) Nếu bạn vẫn muốn hỗ trợ PUT dạng JSON thuần
  updateUserJson(id: number, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, user);
  }
  deleteUserById(id: number): Observable<any> {
  const token = localStorage.getItem('accessToken'); // hoặc từ AuthService nếu có
  const headers = {
    Authorization: `Bearer ${token}`
  };

  return this.http.delete<any>(`${this.apiUrl}/delete/${id}`, { headers });
}


}
