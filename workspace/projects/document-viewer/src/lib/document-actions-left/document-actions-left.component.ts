import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DocumentViewerService } from '../document-viewer.service';
import { DocumentActions } from '../_config/document-actions.model';
import { DocumentConfig } from '../_config/document.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-document-actions-left',
  templateUrl: './document-actions-left.component.html',
  styleUrls: ['./document-actions-left.component.scss'],
})
export class DocumentActionsLeftComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  modalStatus: boolean = false;
  subscription = new Subscription();
  originalDocument: boolean = false;
  @Input('document') document: DocumentComponent | undefined;
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
    containerHeight: 0,
  };
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    informationHelp: '',
    downloadPdfPlain: '',
  };
  @Output('downloadDocument') downloadDocumentEvent = new EventEmitter();

  defaultConfig: DocumentConfig = { containerWidth: 0, containerHeight: 0 };

  constructor(private docViewerService: DocumentViewerService) {}

  ngOnInit(): void {
    this.subscription = this.docViewerService.modalStatus.subscribe(
      (status) => {
        this.modalStatus = status;
      }
    );
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
  }

  openModal() {
    this.modalStatus = true;
    this.docViewerService.modalStatus.next(this.modalStatus);
  }

  downloadDocument() {
    this.downloadDocumentEvent.emit(true);
  }

  showOriginalDocument() {
    this.docViewerService.changeDocSubject.next(true);
    this.originalDocument = !this.originalDocument;
    this.docViewerService.showOriginalDoc.next(this.originalDocument);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
    if (
      changes['documentActionsSrc'] &&
      changes['documentActionsSrc'].currentValue
    ) {
      this.documentActionsSrc = changes['documentActionsSrc'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
