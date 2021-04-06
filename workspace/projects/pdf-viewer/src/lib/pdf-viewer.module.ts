import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PdfViewerComponent } from './pdf-viewer.component';
import { DocumentComponent } from './document/document.component';
import { DocumentActionsComponent } from './document-actions/document-actions.component';
import { PageNavigationComponent } from './page-navigation/page-navigation.component';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PdfViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    PageNavigationComponent,
  ],
  imports: [SharedComponentsModule, CommonModule, FormsModule],
  exports: [
    PdfViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    PageNavigationComponent,
  ],
})
export class PdfViewerModule {}
