import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Tạo headers với authorization token
  private getAuthHeaders(): HttpHeaders {
    // Kiểm tra nếu đang chạy trong browser
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Not running in browser, skipping localStorage access');
      return new HttpHeaders();
    }

    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log
    
    if (!token) {
      console.warn('No token found in localStorage');
      return new HttpHeaders();
    }
    
    // Ensure token doesn't have "Bearer " prefix already
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    return new HttpHeaders({
      'Authorization': `Bearer ${cleanToken}`
    });
  }

  // GET request với authentication
  get<T>(endpoint: string): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  // POST request với authentication
  post<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // POST FormData với authentication  
  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }

  // PUT request với authentication
  put<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // DELETE request với authentication
  delete<T>(endpoint: string): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  // GET blob với authentication (dành cho video streaming)
  getBlob(endpoint: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}${endpoint}`, { 
      headers, 
      responseType: 'blob' 
    });
  }

  // Video-specific methods
  getVideosByCourse(courseId: number): Observable<any[]> {
    return this.get<any[]>(`/videos/course/${courseId}`);
  }

  streamVideo(videoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/videos/stream/${videoId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  uploadVideo(formData: FormData): Observable<any> {
    return this.postFormData('/videos/upload', formData);
  }

  // Course-specific methods
  getCoursesByUser(categoryId?: number, status?: string): Observable<any[]> {
    let endpoint = '/courses/list';
    const params = [];
    if (categoryId) params.push(`categoryId=${categoryId}`);
    if (status) params.push(`status=${status}`);
    if (params.length) endpoint += `?${params.join('&')}`;
    
    return this.get<any[]>(endpoint);
  }
}
