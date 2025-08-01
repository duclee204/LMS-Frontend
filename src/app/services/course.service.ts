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
  private baseUrl = 'https://lms-backend001-9bfc04222cdc.herokuapp.com/api/courses';

  constructor(private http: HttpClient) {}

  getCourses(categoryId?: number, status?: string): Observable<Course[]> {
    let params = new HttpParams();
    if (categoryId != null) params = params.set('categoryId', categoryId.toString());
    if (status) params = params.set('status', status);

    return this.http.get<Course[]>(`${this.baseUrl}/list`, { params });
  }

  createCourse(
    course: Omit<Course, 'id' | 'thumbnailUrl' | 'instructorImage'>,
    imageFile: File
  ): Observable<any> {
    const formData = this.buildFormData(course, imageFile);
    return this.http.post(`${this.baseUrl}/create`, formData);
  }

  updateCourse(
    id: number,
    courseData: Partial<Course>,
    imageFile?: File
  ): Observable<any> {
    const formData = this.buildFormData(courseData, imageFile);
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${courseId}`, {
      responseType: 'text'  // nếu backend trả về chuỗi thay vì JSON
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
}
