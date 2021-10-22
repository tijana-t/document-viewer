import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';
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
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
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
    informationHelp: '',
    downloadPdfPlain: '',
  };
  defaultConfig: DocumentConfig = { containerWidth: 0, containerHeight: 0 };
  zoomInDisabled = false;
  zoomOutDisabled = false;
  destroy$ = new Subject();
  documentPage: HTMLElement | null = null;
  transImg: any;
  incrementScale = 1;
  ZOOM_STEP = 1.12;
  pageHeight: number = 0;
  pageWidth: number = 0;

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.documentPage = document.getElementById('document-page');
    this.transImg = document.getElementById('trans-img');
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
    this.pageHeight = this.defaultConfig.containerHeight;
    this.pageWidth = this.defaultConfig.containerWidth;
  }

  zoomInImg() {
    if (this.documentConfig.containerHeight > 2200) {
      this.zoomInDisabled = true;
    } else {
      this.pdfViewerService.docConfSubject.next({
        containerHeight: this.ZOOM_STEP * this.documentConfig.containerHeight,
        containerWidth: this.ZOOM_STEP * this.documentConfig.containerWidth,
      });
      setTimeout(() => {
        const textLayer = document.getElementById('textLayer');
        const zoomLevel =
          (this.documentConfig.containerHeight * this.ZOOM_STEP) /
          this.pageHeight;
        if (textLayer) {
          textLayer.style.transform = 'scale(' + zoomLevel + ')';
        }
        this.documentConfig.containerHeight =
          this.ZOOM_STEP * this.documentConfig.containerHeight;
        this.documentConfig.containerWidth =
          this.ZOOM_STEP * this.documentConfig.containerWidth;
      }, 0);

      this.zoomOutDisabled = false;
    }
  }

  zoomOutImg() {
    if (this.documentConfig.containerHeight <= 400) {
      this.zoomOutDisabled = true;
    } else {
      this.pdfViewerService.docConfSubject.next({
        containerHeight: this.documentConfig.containerHeight / this.ZOOM_STEP,
        containerWidth: this.ZOOM_STEP * this.documentConfig.containerWidth,
      });
      setTimeout(() => {
        const textLayer = document.getElementById('textLayer');
        const zoomLevel =
          this.documentConfig.containerHeight /
          this.ZOOM_STEP /
          this.pageHeight;
        if (textLayer) {
          textLayer.style.transform = 'scale(' + zoomLevel + ')';
        }
        this.documentConfig.containerHeight =
          this.documentConfig.containerHeight / this.ZOOM_STEP;
        this.documentConfig.containerWidth =
          this.documentConfig.containerWidth / this.ZOOM_STEP;
      }, 0);

      this.zoomInDisabled = false;
    }
  }

  fitToPage() {
    this.pdfViewerService.docConfSubject.next({
      containerHeight: this.pageHeight,
      containerWidth: this.pageWidth,
    });
    setTimeout(() => {
      const textLayer = document.getElementById('textLayer');
      const zoomLevel = 1;
      this.zoomInDisabled = false;
      this.zoomOutDisabled = false;
      if (textLayer) {
        textLayer.style.transform = 'scale(' + zoomLevel + ')';
      }
      this.documentConfig.containerHeight = this.pageHeight;
      this.documentConfig.containerWidth = this.pageWidth;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
