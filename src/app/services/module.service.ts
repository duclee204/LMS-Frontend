import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ModulesApiService } from './modules-api.service';
import { Module, CreateModuleRequest, UpdateModuleRequest } from '../models/module.model';

// Interface cho component hiện tại (backwards compatibility)
export interface ModuleItem {
  moduleId?: number;
  title: string;
  name?: string; // Alias for title for backwards compatibility
  description: string;
  orderNumber?: number;
  status?: 'Published' | 'NotPublished';
  showDropdown?: boolean;
  // New properties for video management
  expanded?: boolean;
  videos?: any[];
  loadingVideos?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  
  // State management cho danh sách modules
  private modulesSubject = new BehaviorSubject<Module[]>([]);
  public modules$ = this.modulesSubject.asObservable();
  
  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Current course ID for context
  private currentCourseId: number | null = null;

  constructor(private modulesApiService: ModulesApiService) { }

  /**
   * Set current course ID for context
   * @param courseId ID của khóa học hiện tại
   */
  setCurrentCourseId(courseId: number): void {
    this.currentCourseId = courseId;
  }

  /**
   * Lấy danh sách modules cho component hiện tại (backwards compatibility)
   */
  getModules(): Observable<ModuleItem[]> {
    if (!this.currentCourseId) {
      console.warn('Course ID not set. Please call setCurrentCourseId() first.');
      // Return empty array instead of error
      return of([]);
    }
    
    console.log('Getting modules for courseId:', this.currentCourseId);
    
    return this.loadModules(this.currentCourseId).pipe(
      map(modules => {
        console.log('Raw modules from API:', modules);
        const mappedModules = modules.map(module => ({
          moduleId: module.moduleId,
          title: module.title,
          name: module.title, // Alias for backwards compatibility
          description: module.description,
          orderNumber: module.orderNumber,
          status: 'Published' as 'Published' | 'NotPublished', // Default status
          showDropdown: false
        }));
        console.log('Mapped modules:', mappedModules);
        return mappedModules;
      }),
      catchError(error => {
        console.error('Error in getModules:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Tạo module mới (backwards compatibility)
   * @param moduleData Dữ liệu module
   */
  createModule(moduleData: Partial<ModuleItem>): Observable<string> {
    console.log('Creating module with data:', moduleData);
    
    if (!this.currentCourseId) {
      console.error('Course ID not set when creating module');
      return throwError(() => new Error('Course ID not set'));
    }

    const createRequest: CreateModuleRequest = {
      title: moduleData.title || '',
      description: moduleData.description || '',
      orderNumber: moduleData.orderNumber || 1
    };

    console.log('Create request:', createRequest);
    console.log('Current courseId:', this.currentCourseId);

    return this.createModuleForCourse(this.currentCourseId, createRequest);
  }

  /**
   * Cập nhật module (backwards compatibility)
   * @param moduleData Dữ liệu module
   */
  updateModule(moduleData: ModuleItem): Observable<string> {
    if (!this.currentCourseId || !moduleData.moduleId) {
      return throwError(() => new Error('Course ID or Module ID not set'));
    }

    const updateRequest: UpdateModuleRequest = {
      courseId: this.currentCourseId,
      title: moduleData.title,
      description: moduleData.description,
      orderNumber: moduleData.orderNumber || 1
    };

    return this.updateModuleById(moduleData.moduleId, updateRequest);
  }

  /**
   * Lấy danh sách modules cho một khóa học và cập nhật state
   * @param courseId ID của khóa học
   */
  loadModules(courseId: number): Observable<Module[]> {
    this.loadingSubject.next(true);
    
    return this.modulesApiService.getModulesByCourse(courseId).pipe(
      tap(modules => {
        this.modulesSubject.next(modules);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error loading modules:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Tạo module mới
   * @param courseId ID của khóa học
   * @param moduleData Dữ liệu module
   */
  createModuleForCourse(courseId: number, moduleData: CreateModuleRequest): Observable<any> {
    console.log('🚀 ModuleService.createModuleForCourse called');
    console.log('🚀 courseId:', courseId);
    console.log('🚀 moduleData:', moduleData);
    
    this.loadingSubject.next(true);
    
    return this.modulesApiService.createModule(courseId, moduleData).pipe(
      tap((response) => {
        console.log('🚀 Module created successfully, response:', response);
        // Reload modules sau khi tạo thành công
        this.loadModules(courseId).subscribe();
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error in ModuleService.createModuleForCourse:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cập nhật module
   * @param moduleId ID của module
   * @param moduleData Dữ liệu cập nhật
   */
  updateModuleById(moduleId: number, moduleData: UpdateModuleRequest): Observable<string> {
    this.loadingSubject.next(true);
    
    return this.modulesApiService.updateModule(moduleId, moduleData).pipe(
      tap(() => {
        // Reload modules sau khi cập nhật thành công
        this.loadModules(moduleData.courseId).subscribe();
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error updating module:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Xóa module
   * @param moduleId ID của module
   * @param courseId ID của khóa học
   */
  deleteModule(moduleId: number, courseId: number): Observable<string> {
    this.loadingSubject.next(true);
    
    return this.modulesApiService.deleteModule(moduleId, courseId).pipe(
      tap(() => {
        // Reload modules sau khi xóa thành công
        this.loadModules(courseId).subscribe();
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error deleting module:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lấy current modules từ state
   */
  getCurrentModules(): Module[] {
    return this.modulesSubject.value;
  }

  /**
   * Tìm module theo ID
   * @param moduleId ID của module
   */
  getModuleById(moduleId: number): Module | undefined {
    return this.getCurrentModules().find(module => module.moduleId === moduleId);
  }

  /**
   * Reset state
   */
  clearModules(): void {
    this.modulesSubject.next([]);
  }

}