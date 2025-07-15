import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { Title } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';           // ✅ Cho [(ngModel)]
import { CommonModule } from '@angular/common';         // ✅ Cho *ngIf, [ngClass], [ngStyle]
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ModuleComponent } from './pages/module/module.component'; // 👈 THÊM VÀO
import { AddmoduleComponent } from './pages/addmodule/addmodule.component'; 
import { ExamModule } from './pages/exam/exam.module'; // 👈 Thêm dòng này
import { ExamComponent } from './pages/exam/exam.component'; // 👈 Thêm dòng này
import { GradingComponent } from './pages/grading/grading.component'; // 👈 Thêm dòng này
import { DoExamComponent } from './pages/doexam/doexam.component'; // 👈 Thêm dòng này
import { QuestionComponent } from './pages/question/question.component';
import { Question1Component } from './pages/question1/question1.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { XemDiemComponent } from './pages/xemdiem/xemdiem.component';
import { KeyComponent } from './pages/key/key.component';
import { Doexam2Component } from './pages/doexam2/doexam2.component'; // Nếu đang dùng standalone thì không cần import vào declarations


@NgModule({
  declarations: [
    AppComponent,
    ModuleComponent, // 👈 Quan trọng
    AddmoduleComponent, // 👈 Quan trọng
    ExamComponent, // 👈 Đã có
    GradingComponent, // 👈 Thêm dòng này
    DoExamComponent, // 👈 Thêm dòng này
    QuestionComponent,
    Question1Component,
    QuizzesComponent,
    XemDiemComponent,
    KeyComponent,
    // Không cần AddexamComponent ở đây nếu đã dùng AddexamModule
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,             // ✅ ngModel
    CommonModule,            // ✅ *ngIf, ngClass
    ReactiveFormsModule,
    HttpClientModule,
    ExamModule, // 👈 Đã có
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
