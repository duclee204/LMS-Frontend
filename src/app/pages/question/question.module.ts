import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from './question.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [QuestionComponent],
  imports: [CommonModule, RouterModule],
  exports: [QuestionComponent],
})
export class QuestionModule {}
