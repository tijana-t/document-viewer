import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchModalComponent } from './modals/search-modal/search-modal.component';

@NgModule({
  declarations: [SearchModalComponent],
  imports: [CommonModule, FormsModule],
  exports: [SearchModalComponent],
  providers: [],
})
export class SharedComponentsModule {}
