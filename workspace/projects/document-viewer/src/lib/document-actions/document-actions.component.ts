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
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input('document') document: DocumentComponent | undefined;
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  @Output('isOpen') isOpen = new EventEmitter();
  @Output('sendDocConfig') sendDocConfig = new EventEmitter();
  @Output('switchSelection') switchSelection = new EventEmitter();
  @Input('isOpenVar') isOpenVar: boolean = false;
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    zoomInSrc: '',
    zoomOutSrc: '',
    fitToPageSrc: '../../assets/icons/zoom-in.svg' || '',
    informationHelp: '',
    downloadPdfPlain: '',
    rotateIcon: '',
    squareSelection: '',
    squareSelectionYellow: '',
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
  scalingApplied: boolean = false;
  squareSelectionActive = false;
  constructor(private docViewerService: DocumentViewerService) {}

  ngOnInit(): void {
    this.documentPage = document.getElementById('document-page');
    this.transImg = document.getElementById('trans-img');
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
    this.pageWidth = this.defaultConfig.containerWidth;
    this.scrollEvent();
  }

  squareSelection() {
    this.squareSelectionActive = !this.squareSelectionActive;
    this.switchSelection.emit(true);
  }

  zoomInImg() {
    if (this.documentConfig.containerWidth > 2200) {
      this.zoomInDisabled = true;
    } else {
      setTimeout(() => {
        const elemToZoom = document.getElementById('elemToZoom') || document.getElementById('docImgOrginal');
        if (elemToZoom) {
          const realelemToZoomWidth = (elemToZoom?.style.width).split('px');
          const zoomLevel =
            (this.documentConfig.containerWidth * this.ZOOM_STEP) /
            parseInt(realelemToZoomWidth[0]);
          elemToZoom.style.transform = 'scale(' + zoomLevel + ')';
          this.documentConfig.containerWidth = Math.floor(
            this.ZOOM_STEP * this.documentConfig.containerWidth
          );
          this.docViewerService.docConfSubject.next(this.documentConfig);

          this.sendDocConfig.emit(this.documentConfig);
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
        const elemToZoom = document.getElementById('textLayer') || document.getElementById('docImgOrginal');
        if (elemToZoom) {
          const realelemToZoomWidth = (elemToZoom?.style.width)?.split('px')[0];
          const zoomLevel =
            this.documentConfig.containerWidth /
            this.ZOOM_STEP /
            parseInt(realelemToZoomWidth);
            if(elemToZoom){
              elemToZoom.style.transform = 'scale(' + zoomLevel + ')';
            }
            console.log('container', this.documentConfig);
          this.documentConfig.containerWidth = Math.floor(
            this.documentConfig.containerWidth / this.ZOOM_STEP
          );
          this.docViewerService.docConfSubject.next(this.documentConfig);

          this.sendDocConfig.emit(this.documentConfig);
          this.scrollEvent();
        }
      }, 0);
      this.zoomInDisabled = false;
    }
  }

  fitToPage() {
    // this.scalingApplied = false;
    setTimeout(() => {
      const textLayer = document.getElementById('textLayer') || document.getElementById('docImgOrginal');
      const docImg = document.getElementById('docImgOrginal');
      const viewerContainer = document.getElementById('document-container');

      if (textLayer && viewerContainer && docImg) {
        // Check if scaling has already been applied
        if (!this.scalingApplied) {
          // Calculate available height for scaling, considering margins
          const margin = 34 * 2;
          const availableHeight = viewerContainer.offsetHeight - margin;

          // Calculate scale factors based on available height
          const SCALE_FACTOR_IMAGE = availableHeight / docImg.offsetHeight;
          const SCALE_FACTOR_TEXT = availableHeight / textLayer.offsetHeight;

          // Choose the minimum scale factor to ensure both image and text fit within the container
          const minScaleFactor = Math.min(
            SCALE_FACTOR_IMAGE,
            SCALE_FACTOR_TEXT
          );

          if (minScaleFactor < 1) {
            // Apply the scale factor to both text and image
            textLayer.style.transform = 'scale(' + minScaleFactor + ')';
            this.documentConfig.containerWidth =
              docImg.offsetWidth * minScaleFactor;
          } else {
            // Reset the textLayer to its original state
            textLayer.style.transform = 'none';
            this.documentConfig.containerWidth = docImg.offsetWidth;
          }

          // Set the flag to indicate that scaling has been applied
          this.scalingApplied = true;
        }
      } else {
        console.log('Not detected textLayer, viewerContainer, or docImg');
      }

      // Notify subscribers about the updated document configuration
      this.docViewerService.docConfSubject.next(this.documentConfig);

      // Additional functions to be called after the scaling logic (e.g., scrollEvent)
      this.scrollEvent();

      // Reset zoom states if needed
      this.zoomInDisabled = false;
      this.zoomOutDisabled = false;

      this.sendDocConfig.emit(this.documentConfig);
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
      this.scrollEvent();
    }
    if (changes['isOpenVar'] && changes['isOpenVar'].currentValue) {
      this.opend = changes['isOpenVar'].currentValue;
      this.isOpen.emit(this.opend);
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
    console.log('opend', this.isOpenVar);
    this.opend = this.isOpenVar !== undefined ? !this.isOpenVar : !this.opend;
    this.isOpen.emit(this.opend);
  }
  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
