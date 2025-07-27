import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Module, CreateModuleRequest, UpdateModuleRequest } from '../models/module.model';

@Injectable({
  providedIn: 'root'
})
export class ModulesApiService {

  constructor(private apiService: ApiService) { }

  /**
   * Tạo module mới cho một khóa học
   * @param courseId ID của khóa học
   * @param moduleData Dữ liệu module cần tạo
   * @returns Observable<any> response object từ server
   */
  createModule(courseId: number, moduleData: CreateModuleRequest): Observable<any> {
    console.log('🚀 Creating module for courseId:', courseId);
    console.log('🚀 Module data:', moduleData);
    console.log('🚀 API URL:', `/modules/${courseId}`);
    
    return this.apiService.post<any>(`/modules/${courseId}`, moduleData);
  }

  /**
   * Lấy danh sách modules của một khóa học
   * @param courseId ID của khóa học
   * @returns Observable<Module[]> danh sách modules
   */
  getModulesByCourse(courseId: number): Observable<Module[]> {
    return this.apiService.get<Module[]>(`/modules/${courseId}`);
  }

  /**
   * Cập nhật thông tin module
   * @param moduleId ID của module
   * @param moduleData Dữ liệu module cần cập nhật
   * @returns Observable<string> thông báo thành công
   */
  updateModule(moduleId: number, moduleData: UpdateModuleRequest): Observable<string> {
    return this.apiService.put<string>(`/modules/${moduleId}`, moduleData);
  }

  /**
   * Xóa module
   * @param moduleId ID của module cần xóa
   * @param courseId ID của khóa học (để check quyền)
   * @returns Observable<string> thông báo thành công
   */
  deleteModule(moduleId: number, courseId: number): Observable<string> {
    return this.apiService.delete<string>(`/modules/${moduleId}?courseId=${courseId}`);
  }
}
