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
import { PdfViewerService } from '../pdf-viewer.service';
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

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.subscription = this.pdfViewerService.modalStatus.subscribe(
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
    this.pdfViewerService.modalStatus.next(this.modalStatus);
  }

  downloadDocument() {
    this.downloadDocumentEvent.emit(true);
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
