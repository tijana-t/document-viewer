import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LazyLoadDirective } from './directives/img-lazy-load.directive';
import { SearchModalComponent } from './modals/search-modal/search-modal.component';
import { SecureImgPipe } from './pipes/secure-img.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [SearchModalComponent, SecureImgPipe, LazyLoadDirective],
  imports: [CommonModule, FormsModule, NgbModule],
  exports: [SearchModalComponent, SecureImgPipe, LazyLoadDirective],
  providers: [],
})
export class SharedComponentsModule {}
