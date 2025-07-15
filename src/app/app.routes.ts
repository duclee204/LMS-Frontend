import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ModuleComponent } from './pages/module/module.component';
import { AddmoduleComponent } from './pages/addmodule/addmodule.component';
import { UploadmoduleComponent } from './pages/uploadmodule/uploadmodule.component';
import { AddExamComponent } from './pages/addexam/addexam.component';
import { ExamComponent } from './pages/exam/exam.component';
import { GradingComponent } from './pages/grading/grading.component';
import { DoExamComponent } from './pages/doexam/doexam.component';
import { QuestionComponent } from './pages/question/question.component';
import { Question1Component } from './pages/question1/question1.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { XemDiemComponent } from './pages/xemdiem/xemdiem.component';
import { KeyComponent } from './pages/key/key.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'login', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Đăng ký tài khoản' } },
  { path: 'module', component: ModuleComponent, data: { title: 'Module' } },
  { path: 'addmodule', component: AddmoduleComponent, data: { title: 'Add Module' } },
  { path: 'uploadmodule', component: UploadmoduleComponent, data: { title: 'Upload Module' } },
  { path: 'addexam', component: AddExamComponent, data: { title: 'Add Exam' } },
  { path: 'exam', component: ExamComponent, data: { title: 'Exam' } },
  { path: 'grading', component: GradingComponent, data: { title: 'Grading' } },
  { path: 'doexam', component: DoExamComponent, data: { title: 'Làm bài' } },
  { path: 'question', component: QuestionComponent, data: { title: 'Question' } },
  { path: 'question1', component: Question1Component, data: { title: 'Question 1' } },
  { path: 'quizzes', component: QuizzesComponent, data: { title: 'Quizzes' } },
  {
    path: 'xemdiem',
  loadComponent: () => import('./pages/xemdiem/xemdiem.component').then(m => m.XemDiemComponent)
  },
  { path: 'key', component: KeyComponent, data: { title: 'Key' } },
  {
    path: 'doexam2',
    loadComponent: () => import('./pages/doexam2/doexam2.component').then(m => m.Doexam2Component)
  },
  {
    path: 'doexam3',
    loadComponent: () => import('./pages/doexam3/doexam3.component').then(m => m.Doexam3Component)
  },
  {
    path: 'key1',
    loadComponent: () => import('./pages/key1/key1.component').then(m => m.Key1Component)
  },
];
