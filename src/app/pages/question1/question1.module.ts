import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question1Component } from './question1.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [Question1Component],
  imports: [CommonModule, RouterModule],
  exports: [Question1Component],
})
export class Question1Module {}
