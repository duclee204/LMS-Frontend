import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Course {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  instructorId: number;
  status: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  getCourses(): Observable<Course[]> {
    // Dummy data, replace with real API call
    return of([
      { id: 1, title: 'Course 1', description: 'Desc', categoryId: 1, instructorId: 1, status: 'active', price: 100 },
      { id: 2, title: 'Course 2', description: 'Desc', categoryId: 2, instructorId: 2, status: 'inactive', price: 200 }
    ]);
  }
}
