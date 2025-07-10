import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Course {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  instructorId: number;
  status: string;
  price: number;
  thumbnailUrl: string;
  instructorImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private baseUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {}

  getCourses(categoryId?: number, status?: string): Observable<Course[]> {
    let params = new HttpParams();
    if (categoryId != null) params = params.set('categoryId', categoryId.toString());
    if (status) params = params.set('status', status);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token
    });

    return this.http.get<Course[]>(`${this.baseUrl}/list`, { params, headers });
  }

  createCourse(
    course: Omit<Course, 'id' | 'thumbnailUrl' | 'instructorImage'>,
    imageFile: File
  ): Observable<any> {
    const formData = this.buildFormData(course, imageFile);
    return this.http.post(`${this.baseUrl}/create`, formData, {
      headers: this.buildAuthHeaders()
    });
  }

  updateCourse(
    id: number,
    courseData: Partial<Course>,
    imageFile?: File
  ): Observable<any> {
    const formData = this.buildFormData(courseData, imageFile);
    return this.http.put(`${this.baseUrl}/${id}`, formData, {
      headers: this.buildAuthHeaders()
    });
  }

  // ✅ Helper để build FormData
  private buildFormData(courseData: any, imageFile?: File): FormData {
    const formData = new FormData();
    formData.append(
      'course',
      new Blob([JSON.stringify(courseData)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return formData;
  }

  // ✅ Helper để tạo Authorization header
  private buildAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: 'Bearer ' + token
    });
  }
  deleteCourse(courseId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${courseId}`, {
    headers: this.buildAuthHeaders(),
    responseType: 'text'  // nếu backend trả về chuỗi thay vì JSON
  });
}

}
