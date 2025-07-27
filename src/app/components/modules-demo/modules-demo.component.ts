import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleService } from '../../services/module.service';
import { ModulesApiService } from '../../services/modules-api.service';
import { Module, CreateModuleRequest, UpdateModuleRequest } from '../../models/module.model';

@Component({
  selector: 'app-modules-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <h1>Demo API Modules</h1>
      
      <!-- Form tạo module mới -->
      <div class="section">
        <h2>Tạo Module Mới</h2>
        <form (ngSubmit)="createModule()" #createForm="ngForm">
          <div class="form-group">
            <label>Course ID:</label>
            <input type="number" [(ngModel)]="newModule.courseId" name="courseId" required>
          </div>
          <div class="form-group">
            <label>Title:</label>
            <input type="text" [(ngModel)]="newModule.title" name="title" required>
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea [(ngModel)]="newModule.description" name="description"></textarea>
          </div>
          <div class="form-group">
            <label>Order Number:</label>
            <input type="number" [(ngModel)]="newModule.orderNumber" name="orderNumber" required>
          </div>
          <button type="submit" [disabled]="createForm.invalid || creating">
            {{ creating ? 'Creating...' : 'Create Module' }}
          </button>
        </form>
      </div>

      <!-- Danh sách modules -->
      <div class="section">
        <h2>Danh sách Modules</h2>
        <div class="form-group">
          <label>Course ID để load modules:</label>
          <input type="number" [(ngModel)]="courseIdToLoad" placeholder="Nhập course ID">
          <button (click)="loadModules()" [disabled]="loading">
            {{ loading ? 'Loading...' : 'Load Modules' }}
          </button>
        </div>

        <div *ngIf="modules.length > 0">
          <div class="module-item" *ngFor="let module of modules">
            <h3>{{ module.title }}</h3>
            <p><strong>ID:</strong> {{ module.moduleId }}</p>
            <p><strong>Course ID:</strong> {{ module.courseId }}</p>
            <p><strong>Description:</strong> {{ module.description }}</p>
            <p><strong>Order:</strong> {{ module.orderNumber }}</p>
            
            <div class="actions">
              <button (click)="startEdit(module)">Edit</button>
              <button (click)="deleteModule(module.moduleId, module.courseId)" class="delete-btn">
                Delete
              </button>
            </div>

            <!-- Form edit -->
            <div *ngIf="editingModule && editingModule.moduleId === module.moduleId" class="edit-form">
              <h4>Edit Module</h4>
              <div class="form-group">
                <label>Title:</label>
                <input type="text" [(ngModel)]="editingModule.title">
              </div>
              <div class="form-group">
                <label>Description:</label>
                <textarea [(ngModel)]="editingModule.description"></textarea>
              </div>
              <div class="form-group">
                <label>Order Number:</label>
                <input type="number" [(ngModel)]="editingModule.orderNumber">
              </div>
              <div class="actions">
                <button (click)="updateModule()" [disabled]="updating">
                  {{ updating ? 'Updating...' : 'Update' }}
                </button>
                <button (click)="cancelEdit()">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="modules.length === 0 && !loading">
          <p>Không có modules nào.</p>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="message" [ngClass]="messageType">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .section {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    textarea {
      height: 100px;
      resize: vertical;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
    }

    button:hover:not(:disabled) {
      background: #0056b3;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .delete-btn {
      background: #dc3545;
    }

    .delete-btn:hover:not(:disabled) {
      background: #c82333;
    }

    .module-item {
      border: 1px solid #eee;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 15px;
      background: #f9f9f9;
    }

    .actions {
      margin-top: 10px;
    }

    .edit-form {
      margin-top: 15px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background: white;
    }

    .message {
      padding: 10px;
      border-radius: 5px;
      margin-top: 20px;
    }

    .message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class ModulesDemoComponent implements OnInit {
  modules: Module[] = [];
  courseIdToLoad: number = 1; // Default course ID for demo
  
  newModule: CreateModuleRequest = {
    courseId: 1,
    title: '',
    description: '',
    orderNumber: 1
  };

  editingModule: UpdateModuleRequest | null = null;
  
  loading = false;
  creating = false;
  updating = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private moduleService: ModuleService,
    private modulesApiService: ModulesApiService
  ) {}

  ngOnInit(): void {
    // Load modules mặc định cho course ID 1
    this.loadModules();
  }

  loadModules(): void {
    if (!this.courseIdToLoad) return;
    
    this.loading = true;
    this.clearMessage();

    this.modulesApiService.getModulesByCourse(this.courseIdToLoad)
      .subscribe({
        next: (modules) => {
          this.modules = modules;
          this.loading = false;
          this.showMessage(`Loaded ${modules.length} modules successfully`, 'success');
        },
        error: (error) => {
          this.loading = false;
          this.showMessage(`Error loading modules: ${error.error?.message || error.message}`, 'error');
          console.error('Error loading modules:', error);
        }
      });
  }

  createModule(): void {
    this.creating = true;
    this.clearMessage();

    const courseId = this.newModule.courseId!;
    const createRequest = {
      title: this.newModule.title,
      description: this.newModule.description,
      orderNumber: this.newModule.orderNumber
    };

    this.modulesApiService.createModule(courseId, createRequest)
      .subscribe({
        next: (response) => {
          this.creating = false;
          this.showMessage('Module created successfully', 'success');
          // Reset form
          this.newModule = {
            courseId: courseId,
            title: '',
            description: '',
            orderNumber: 1
          };
          // Reload modules if we're viewing the same course
          if (courseId === this.courseIdToLoad) {
            this.loadModules();
          }
        },
        error: (error) => {
          this.creating = false;
          this.showMessage(`Error creating module: ${error.error?.message || error.message}`, 'error');
          console.error('Error creating module:', error);
        }
      });
  }

  startEdit(module: Module): void {
    this.editingModule = {
      moduleId: module.moduleId,
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      orderNumber: module.orderNumber
    };
  }

  updateModule(): void {
    if (!this.editingModule) return;

    this.updating = true;
    this.clearMessage();

    this.modulesApiService.updateModule(this.editingModule.moduleId!, this.editingModule)
      .subscribe({
        next: (response) => {
          this.updating = false;
          this.editingModule = null;
          this.showMessage('Module updated successfully', 'success');
          this.loadModules(); // Reload to see changes
        },
        error: (error) => {
          this.updating = false;
          this.showMessage(`Error updating module: ${error.error?.message || error.message}`, 'error');
          console.error('Error updating module:', error);
        }
      });
  }

  cancelEdit(): void {
    this.editingModule = null;
  }

  deleteModule(moduleId: number, courseId: number): void {
    if (!confirm('Bạn có chắc chắn muốn xóa module này?')) return;

    this.clearMessage();

    this.modulesApiService.deleteModule(moduleId, courseId)
      .subscribe({
        next: (response) => {
          this.showMessage('Module deleted successfully', 'success');
          this.loadModules(); // Reload to see changes
        },
        error: (error) => {
          this.showMessage(`Error deleting module: ${error.error?.message || error.message}`, 'error');
          console.error('Error deleting module:', error);
        }
      });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.clearMessage();
    }, 5000);
  }

  private clearMessage(): void {
    this.message = '';
  }
}
