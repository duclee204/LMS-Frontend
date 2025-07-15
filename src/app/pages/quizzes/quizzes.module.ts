import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizzesComponent } from './quizzes.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [QuizzesComponent],
  imports: [CommonModule, RouterModule],
  exports: [QuizzesComponent],
})
export class QuizzesModule {}
