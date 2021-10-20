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

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.documentPage = document.getElementById('document-page');
    this.transImg = document.getElementById('trans-img');
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
  }

  zoomInImg() {
    this.pdfViewerService.zoomInStarted.next(true);
    this.incrementScale += 0.1;
    if (this.documentPage) {
      this.documentPage.style.transform = `scale(${this.incrementScale})`;
      this.transImg.style.transform = `scale(${this.incrementScale})`;
    }
    //disable zoomIn if scale is bigger than 2
    if (this.incrementScale >= 2.0) {
      this.zoomInDisabled = true;
    } else {
      this.zoomInDisabled = false;
    }

    //disable zoom if scale is less than 0.3
    if (this.incrementScale < 0.3) {
      this.zoomOutDisabled = true;
    } else {
      this.zoomOutDisabled = false;
    }
  }

  zoomOutImg() {
    this.incrementScale -= 0.1;
    if (this.documentPage) {
      this.documentPage.style.transform = `scale(${this.incrementScale})`;
      this.transImg.style.transform = `scale(${this.incrementScale})`;
    }

    //disable zoom if scale is less than 0.3
    if (this.incrementScale < 0.3) {
      this.zoomOutDisabled = true;
    } else {
      this.zoomOutDisabled = false;
    }

    //disable zoomIn if scale is bigger than 2
    if (this.incrementScale >= 2.0) {
      this.zoomInDisabled = true;
    } else {
      this.zoomInDisabled = false;
    }
  }

  fitToPage() {
    this.zoomInDisabled = false;
    this.zoomOutDisabled = false;
    this.documentConfig = { ...this.defaultConfig };
    this.incrementScale = 1;

    if (this.documentPage) {
      this.documentPage.style.transform = `scale(1)`;
      this.transImg.style.transform = `scale(1)`;
    }
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
