import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  AssignmentSubmission,
  CreateSubmissionRequest,
  GradeSubmissionRequest
} from '../models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentSubmissionApiService {

  constructor(private apiService: ApiService) {}

  /**
   * Nộp bài tập
   */
  submitAssignment(request: CreateSubmissionRequest, file?: File): Observable<string> {
    console.log('🔍 Submitting assignment API call:', request, file);

    if (!request.assignmentId && request.assignmentId !== 0) {
      console.error('❌ assignmentId is null or undefined!', request);
      return throwError(() => new Error('assignmentId is required'));
    }

    const formData = new FormData();
    formData.append('assignmentId', request.assignmentId.toString());

    if (request.submissionText?.trim()) {
      formData.append('submissionText', request.submissionText.trim());
    }

    if (file) {
      formData.append('file', file);
      console.log('📎 File attached:', file.name);
    }

    return this.apiService.postFormData<string>('/assignment-submissions/submit', formData).pipe(
      catchError(error => {
        console.error('❌ Submission failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lấy danh sách bài nộp theo assignmentId (for instructors)
   */
  getSubmissionsByAssignment(assignmentId: number): Observable<AssignmentSubmission[]> {
    return this.apiService.get<AssignmentSubmission[]>(`/assignment-submissions/assignment/${assignmentId}`);
  }

  /**
   * Lấy bài nộp của tôi (for students)
   */
  getMySubmissions(): Observable<AssignmentSubmission[]> {
    return this.apiService.get<AssignmentSubmission[]>('/assignment-submissions/my-submissions');
  }

  /**
   * Chấm điểm bài tập
   */
  gradeSubmission(submissionId: number, gradeData: GradeSubmissionRequest): Observable<string> {
    return this.apiService.post<string>(`/assignment-submissions/grade/${submissionId}`, gradeData);
  }
}
