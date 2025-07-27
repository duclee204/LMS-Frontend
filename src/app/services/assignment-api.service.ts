import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest } from '../models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentApiService {

  constructor(private apiService: ApiService) { }

  /**
   * Tạo bài tập mới
   */
  createAssignment(request: CreateAssignmentRequest): Observable<string> {
    return this.apiService.post<string>('/assignments/create', request);
  }

  /**
   * Tạo bài tập mới với courseId (temporary)
   */
  createAssignmentByCourse(request: CreateAssignmentRequest & { courseId?: number }): Observable<string> {
    return this.apiService.post<string>('/assignments/create-by-course', request);
  }

  /**
   * Lấy danh sách bài tập theo contentId
   */
  getAssignmentsByContent(contentId: number): Observable<Assignment[]> {
    return this.apiService.get<Assignment[]>(`/assignments/content/${contentId}`);
  }

  /**
   * Cập nhật bài tập
   */
  updateAssignment(assignmentId: number, request: UpdateAssignmentRequest): Observable<string> {
    return this.apiService.put<string>(`/assignments/${assignmentId}`, request);
  }

  /**
   * Xóa bài tập
   */
  deleteAssignment(assignmentId: number, contentId: number): Observable<string> {
    return this.apiService.delete<string>(`/assignments/${assignmentId}?contentId=${contentId}`);
  }

  /**
   * Lấy danh sách bài tập theo courseId (for students and instructors)
   */
  getAssignmentsByCourse(courseId: number): Observable<Assignment[]> {
    console.log('🔍 API call: getting assignments for course', courseId);
    return this.apiService.get<Assignment[]>(`/assignments/course/${courseId}`);
  }
}
