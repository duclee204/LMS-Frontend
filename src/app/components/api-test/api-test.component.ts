import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulesApiService } from '../../services/modules-api.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test-container">
      <h1>🔧 API Testing Tool</h1>
      
      <!-- Test API connectivity -->
      <div class="section">
        <h2>1. Test Backend Connection</h2>
        <button (click)="testBackendConnection()" [disabled]="testing">
          {{ testing ? 'Testing...' : 'Test Connection' }}
        </button>
        <div *ngIf="connectionResult" [ngClass]="connectionStatus">
          {{ connectionResult }}
        </div>
      </div>

      <!-- Test Module API -->
      <div class="section">
        <h2>2. Test Module API</h2>
        <div class="form-group">
          <label>Course ID:</label>
          <input type="number" [(ngModel)]="testCourseId" placeholder="Enter course ID">
        </div>
        
        <div class="button-group">
          <button (click)="testGetModules()" [disabled]="testing">Get Modules</button>
          <button (click)="testCreateModule()" [disabled]="testing">Create Test Module</button>
        </div>
        
        <div *ngIf="apiResult" class="result">
          <h3>API Result:</h3>
          <pre>{{ apiResult }}</pre>
        </div>
      </div>

      <!-- Show Current Session -->
      <div class="section">
        <h2>3. Current Session Info</h2>
        <button (click)="showSessionInfo()">Show Session</button>
        <div *ngIf="sessionInfo" class="result">
          <pre>{{ sessionInfo }}</pre>
        </div>
      </div>

      <!-- Console Logs -->
      <div class="section">
        <h2>4. Console Logs</h2>
        <div class="logs" *ngIf="logs.length > 0">
          <div *ngFor="let log of logs" [ngClass]="'log-' + log.type">
            <span class="log-time">{{ log.time }}</span>: {{ log.message }}
          </div>
        </div>
        <button (click)="clearLogs()">Clear Logs</button>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input {
      width: 200px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      background: #0056b3;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .result, .logs {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin-top: 15px;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
    }

    .success {
      color: green;
      background: #d4edda;
      border-color: #c3e6cb;
    }

    .error {
      color: #721c24;
      background: #f8d7da;
      border-color: #f5c6cb;
    }

    .log-info {
      color: #004085;
    }

    .log-error {
      color: #721c24;
    }

    .log-warn {
      color: #856404;
    }

    .log-time {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class ApiTestComponent {
  testing = false;
  testCourseId = 1;
  connectionResult = '';
  connectionStatus = '';
  apiResult = '';
  sessionInfo = '';
  logs: Array<{type: string, message: string, time: string}> = [];

  constructor(
    private modulesApiService: ModulesApiService,
    private apiService: ApiService
  ) {}

  private addLog(type: string, message: string) {
    this.logs.push({
      type,
      message,
      time: new Date().toLocaleTimeString()
    });
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  testBackendConnection() {
    this.testing = true;
    this.connectionResult = '';
    this.addLog('info', 'Testing backend connection...');

    // Test basic API endpoint
    this.apiService.get<any>('/courses').subscribe({
      next: (response) => {
        this.testing = false;
        this.connectionResult = '✅ Backend connection successful!';
        this.connectionStatus = 'success';
        this.addLog('info', 'Backend connection test passed');
      },
      error: (error) => {
        this.testing = false;
        this.connectionResult = `❌ Backend connection failed: ${error.message}`;
        this.connectionStatus = 'error';
        this.addLog('error', `Backend connection failed: ${error.message}`);
      }
    });
  }

  testGetModules() {
    if (!this.testCourseId) {
      this.addLog('error', 'Please enter a course ID');
      return;
    }

    this.testing = true;
    this.apiResult = '';
    this.addLog('info', `Testing GET modules for courseId: ${this.testCourseId}`);

    this.modulesApiService.getModulesByCourse(this.testCourseId).subscribe({
      next: (modules) => {
        this.testing = false;
        this.apiResult = JSON.stringify(modules, null, 2);
        this.addLog('info', `Successfully loaded ${modules.length} modules`);
      },
      error: (error) => {
        this.testing = false;
        this.apiResult = JSON.stringify(error, null, 2);
        this.addLog('error', `Failed to load modules: ${error.message}`);
      }
    });
  }

  testCreateModule() {
    if (!this.testCourseId) {
      this.addLog('error', 'Please enter a course ID');
      return;
    }

    this.testing = true;
    this.apiResult = '';
    
    const testModule = {
      title: `Test Module ${Date.now()}`,
      description: 'This is a test module created by API test tool',
      orderNumber: 1
    };

    this.addLog('info', `Testing CREATE module for courseId: ${this.testCourseId}`);

    this.modulesApiService.createModule(this.testCourseId, testModule).subscribe({
      next: (response) => {
        this.testing = false;
        this.apiResult = `Success: ${response}`;
        this.addLog('info', 'Successfully created test module');
      },
      error: (error) => {
        this.testing = false;
        this.apiResult = JSON.stringify(error, null, 2);
        this.addLog('error', `Failed to create module: ${error.message}`);
      }
    });
  }

  showSessionInfo() {
    const token = localStorage.getItem('token');
    const sessionData = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      localStorage: Object.keys(localStorage),
      currentUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        (sessionData as any).tokenPayload = payload;
      } catch (e) {
        (sessionData as any).tokenDecodeError = (e as Error).message;
      }
    }

    this.sessionInfo = JSON.stringify(sessionData, null, 2);
    this.addLog('info', 'Session info displayed');
  }

  clearLogs() {
    this.logs = [];
  }
}
