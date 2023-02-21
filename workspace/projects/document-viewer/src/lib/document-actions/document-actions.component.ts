import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DocumentComponent } from '../document/document.component';
import { DocumentViewerService } from '../document-viewer.service';
import { DocumentActions } from '../_config/document-actions.model';
import { DocumentConfig, ShowDocumentConfig } from '../_config/document.model';

@Component({
  selector: 'lib-document-actions',
  templateUrl: './document-actions.component.html',
  styleUrls: ['./document-actions.component.scss'],
})
export class DocumentActionsComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input('document') document: DocumentComponent | undefined;
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  @Output("isOpen") isOpen = new EventEmitter();
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    zoomInSrc: '',
    zoomOutSrc: '',
    fitToPageSrc: '../../assets/icons/zoom-in.svg' || '',
    informationHelp: '',
    downloadPdfPlain: '',
    rotateIcon: '',
  };
  opend: boolean = false;
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
  subscriptions = new Subscription();
  showOrginalConfig: ShowDocumentConfig = {
    showOrginal: false,
    viewPercent: 50,
  };
  constructor(private docViewerService: DocumentViewerService) {
  }

  ngOnInit(): void {
    this.documentPage = document.getElementById('document-page');
    this.transImg = document.getElementById('trans-img');
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
    this.pageWidth = this.defaultConfig.containerWidth;
    this.scrollEvent();
  }

  zoomInImg() {
    if (this.documentConfig.containerWidth > 2200) {
      this.zoomInDisabled = true;
    } else {
      setTimeout(() => {
        const textLayer = document.getElementById('textLayer');
        if (textLayer) {
          const realTextLayerWidth = (textLayer?.style.width).split('px');
          const zoomLevel =
            (this.documentConfig.containerWidth * this.ZOOM_STEP) /
            parseInt(realTextLayerWidth[0]);
          textLayer.style.transform = 'scale(' + zoomLevel + ')';
          this.documentConfig.containerWidth = Math.floor(
            this.ZOOM_STEP * this.documentConfig.containerWidth
          );
          this.docViewerService.docConfSubject.next(this.documentConfig);
          this.scrollEvent();
        }
      }, 0);
      this.zoomOutDisabled = false;
    }
  }

  zoomOutImg() {
    if (this.documentConfig.containerWidth < 200) {
      this.zoomOutDisabled = true;
    } else {
      setTimeout(() => {
        const textLayer = document.getElementById('textLayer');
        if (textLayer) {
          const realTextLayerWidth = (textLayer?.style.width).split('px');
          const zoomLevel =
            this.documentConfig.containerWidth /
            this.ZOOM_STEP /
            parseInt(realTextLayerWidth[0]);
          textLayer.style.transform = 'scale(' + zoomLevel + ')';
          this.documentConfig.containerWidth = Math.floor(
            this.documentConfig.containerWidth / this.ZOOM_STEP
          );
          this.docViewerService.docConfSubject.next(this.documentConfig);
          this.scrollEvent();
        }
      }, 0);
      this.zoomInDisabled = false;
    }
  }

  fitToPage() {
    setTimeout(() => {
      const textLayer = document.getElementById('textLayer');
      const docImg = document.getElementById('docImgOrginal');
      const viewerContainer = document.getElementById('document-container');
      if (textLayer && viewerContainer && docImg) {
        // calculate margin: top = 34px and bottom = 34px set in css
        const SCALE_FACTOR_IMAGE =
          (viewerContainer.offsetHeight - 2 * 50) / docImg.offsetHeight;
        const SCALE_FACTOR_TEXT =
          (viewerContainer.offsetHeight - 2 * 50) / textLayer.offsetHeight;
        if (SCALE_FACTOR_TEXT !== 1) {
          textLayer.style.transform = 'scale(' + SCALE_FACTOR_TEXT + ')';
          this.documentConfig.containerWidth =
            docImg.offsetWidth * SCALE_FACTOR_IMAGE;
        }
      } else {
        console.log('Not detected textLayer');
      }
      this.docViewerService.docConfSubject.next(this.documentConfig);
      this.scrollEvent();
      this.zoomInDisabled = false;
      this.zoomOutDisabled = false;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
      this.scrollEvent();
    }
  }

  scrollEvent() {
    setTimeout(() => {
      this.docViewerService.lineStatus.next(true);
    }, 20);
    setTimeout(() => {
      const documentContainer = document.getElementById('document-container');

      if (documentContainer) {
        if (documentContainer.scrollWidth > documentContainer.clientWidth) {
          this.docViewerService.zoomXStatus.next(true);
        } else {
          this.docViewerService.zoomXStatus.next(false);
        }
      }
    }, 300);
  }
  isOpenEmmit() {
    this.opend = !this.opend;
    this.isOpen.emit(this.opend)
  }
  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
