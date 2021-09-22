import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { DocumentActionsComponent } from './document-actions/document-actions.component';
import { DocumentComponent } from './document/document.component';
import { PageNavigationComponent } from './page-navigation/page-navigation.component';
import { PdfViewerComponent } from './pdf-viewer.component';
import { DragScrollModule } from 'ngx-drag-scroll';

@NgModule({
  declarations: [
    PdfViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    PageNavigationComponent,
  ],
  imports: [
    SharedComponentsModule,
    CommonModule,
    FormsModule,
    DragScrollModule,
  ],
  exports: [
    PdfViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    PageNavigationComponent,
  ],
})
export class PdfViewerModule {}
