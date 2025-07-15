// src/app/services/module.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModuleItem {
  moduleId?: number;
  title: string; // sẽ dùng để hiển thị tiêu đề
  orderNumber: number; // 👈 thêm để sắp xếp & hiển thị thứ tự
  description?: string;
  status: 'Published' | 'NotPublished';
  showDropdown?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private apiUrl = 'http://localhost:8080/api/modules';
  
  private courseId = 1;

  constructor(private http: HttpClient) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getModules(): Observable<ModuleItem[]> {
    return this.http.get<ModuleItem[]>(`${this.apiUrl}/course/${this.courseId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createModule(module: Omit<ModuleItem, 'moduleId'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.courseId}`, {
      courseId: this.courseId,
      title: module.title,
      orderNumber: module.orderNumber,
      description: module.description,
      status: module.status
    }, {
      headers: this.getAuthHeaders()
    });
  }

  updateModule(module: ModuleItem): Observable<any> {
    return this.http.put(`${this.apiUrl}/${module.moduleId}`, {
      moduleId: module.moduleId,
      courseId: this.courseId,
      title: module.title,
      orderNumber: module.orderNumber,
      description: module.description,
      status: module.status
    }, {
      headers: this.getAuthHeaders()
    });
  }
}
