import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyComponent } from './key.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [KeyComponent],
  imports: [CommonModule, RouterModule],
  exports: [KeyComponent],
})
export class KeyModule {}
