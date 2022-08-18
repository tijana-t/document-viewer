import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LazyLoadDirective } from './directives/img-lazy-load.directive';
import { SearchModalComponent } from './modals/search-modal/search-modal.component';
import { SecureImgPipe } from './pipes/secure-img.pipe';
import { SecureSvgPipe } from './pipes/secure-svg.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StringEllipsisPipe } from './pipes/string-ellipsis.pipe';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    SearchModalComponent,
    SecureImgPipe,
    SecureSvgPipe,
    LazyLoadDirective,
    StringEllipsisPipe,
  ],
  imports: [CommonModule, FormsModule, NgbModule],
  exports: [
    SearchModalComponent,
    SecureImgPipe,
    SecureSvgPipe,
    LazyLoadDirective,
    StringEllipsisPipe,
    DragDropModule,
  ],
  providers: [],
})
export class SharedComponentsModule {}
