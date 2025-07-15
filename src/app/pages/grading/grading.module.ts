import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradingComponent } from './grading.component';

@NgModule({
  declarations: [GradingComponent],
  imports: [CommonModule, FormsModule],
  exports: [GradingComponent]
})
export class GradingModule {}
