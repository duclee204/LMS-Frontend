import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoExamComponent } from './doexam.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DoExamComponent],
  imports: [CommonModule, RouterModule],
  exports: [DoExamComponent],
})
export class DoExamModule {}
