import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XemDiemComponent } from './xemdiem.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [XemDiemComponent],
  imports: [CommonModule, RouterModule],
  exports: [XemDiemComponent],
})
export class XemDiemModule {}
