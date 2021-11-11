import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { DocumentActionsComponent } from './document-actions/document-actions.component';
import { DocumentActionsLeftComponent } from './document-actions-left/document-actions-left.component';
import { DocumentComponent } from './document/document.component';
import { PageNavigationComponent } from './page-navigation/page-navigation.component';
import { DocumentViewerComponent } from './document-viewer.component';
import { InfoModalComponent } from './info-modal/info-modal.component';

@NgModule({
  declarations: [
    DocumentViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    DocumentActionsLeftComponent,
    PageNavigationComponent,
    InfoModalComponent,
  ],
  imports: [SharedComponentsModule, CommonModule, FormsModule],
  exports: [
    DocumentViewerComponent,
    DocumentComponent,
    DocumentActionsComponent,
    DocumentActionsLeftComponent,
    PageNavigationComponent,
    InfoModalComponent,
  ],
})
export class DocumentViewerModule {}
