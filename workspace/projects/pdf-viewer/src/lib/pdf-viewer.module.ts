import { NgModule } from '@angular/core';
import { PdfViewerComponent } from './pdf-viewer.component';
import { DocumentComponent } from './document/document.component';
import { DocumentActionsComponent } from './document-actions/document-actions.component';
import { PageChangeComponent } from './page-change/page-change.component';
import { PageThumbnailComponent } from './page-thumbnail/page-thumbnail.component';
import { SharedComponentsModule } from '../shared/shared-components.module';

@NgModule({
  declarations: [
    PdfViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    PageChangeComponent,
    PageThumbnailComponent,
  ],
  imports: [SharedComponentsModule],
  exports: [
    PdfViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    PageChangeComponent,
    PageThumbnailComponent,
  ],
})
export class PdfViewerModule {}
