import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { PdfViewerService } from '../pdf-viewer.service';
import { DocumentActions } from '../_config/document-actions.model';
import { DocumentConfig } from '../_config/document.model';

@Component({
  selector: 'lib-document-actions',
  templateUrl: './document-actions.component.html',
  styleUrls: ['./document-actions.component.scss'],
})
export class DocumentActionsComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input('document') document: DocumentComponent | undefined;
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
    containerHeight: 0,
  };
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    zoomInSrc: '',
    zoomOutSrc: '',
    fitToPageSrc: '',
  };
  defaultConfig: DocumentConfig = { containerWidth: 0, containerHeight: 0 };
  zoomInDisabled = false;
  zoomOutDisabled = false;

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
  }

  zoomInImg() {
    if (this.documentConfig.containerHeight > 2200) {
      this.zoomInDisabled = true;
    } else {
      this.documentConfig.containerHeight =
        50 + this.documentConfig.containerHeight;

      this.pdfViewerService.docConfSubject.next({
        containerHeight: 50 + this.documentConfig.containerHeight,
        containerWidth: null,
      });
      this.zoomOutDisabled = false;
    }
  }

  zoomOutImg() {
    if (this.documentConfig.containerHeight <= 400) {
      this.zoomOutDisabled = true;
    } else {
      this.documentConfig.containerHeight =
        this.documentConfig.containerHeight - 50;

      this.pdfViewerService.docConfSubject.next({
        containerHeight: this.documentConfig.containerHeight - 50,
        containerWidth: null,
      });
      this.zoomInDisabled = false;
    }
  }

  fitToPage() {
    this.zoomInDisabled = false;
    this.zoomOutDisabled = false;
    this.documentConfig = { ...this.defaultConfig };

    this.pdfViewerService.docConfSubject.next({
      containerHeight: this.documentConfig.containerHeight,
      containerWidth: this.documentConfig.containerWidth,
    });
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
}
