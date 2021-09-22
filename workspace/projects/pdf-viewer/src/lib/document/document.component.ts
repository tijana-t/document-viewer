import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { PdfViewerService } from '../pdf-viewer.service';
import { DocumentConfig } from '../_config/document.model';
import { Thumbnail } from '../_config/thumbnail.model';

@Component({
  selector: 'lib-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('documentCanvas') documentCanvas: any;
  @ViewChild('documentImage') documentImage: any;
  @Input('thumbnails') thumbnails: Thumbnail[] = [{ id: '', src: '' }];
  @Input('documentImg') documentImg: string = '';
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
    containerHeight: 0,
  };
  defaultDocConfig: DocumentConfig = { containerWidth: 0, containerHeight: 0 };
  imageTopVal = '34px';
  imageLeftVal = '34px';
  maxContainerHeight = 0;
  maxContainerWidth = 0;
  positon = { top: 0, left: 0, x: 0, y: 0 };

  private readonly destroy$ = new Subject();

  image = new Image();
  pageNumber: number = 1;
  subscriptions = new Subscription();
  constructor(private pdfViewerService: PdfViewerService) {
    this.pdfViewerService.pageNumberSubject
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.pageNumber = res;
          this.documentImage.nativeElement.src =
            this.thumbnails[this.pageNumber - 1].src;
        }
      });

    this.subscriptions.add(
      this.pdfViewerService.docConfSubject
        .pipe(skip(1), takeUntil(this.destroy$))
        .subscribe((res: DocumentConfig) => {
          if (res) {
            this.documentConfig = res;
          }
        })
    );
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
  ngAfterViewInit() {
    this.defaultDocConfig = { ...this.documentConfig };
    this.initDrag();

    const docContainer = document.getElementById('document-container');
    if (docContainer) {
      this.maxContainerHeight =
        this.defaultDocConfig.containerHeight + docContainer.offsetHeight;
      this.maxContainerWidth =
        this.defaultDocConfig.containerWidth + docContainer.offsetWidth;
    }
  }

  scrollEvent(event: Event, documentImage: HTMLElement) {
    const outerCont = document.getElementById('outer-cont');
    if (outerCont) outerCont.style.position = 'static';

    // needs refactoring
    const rectObj: DOMRect = documentImage.getBoundingClientRect();
    const patt = document.getElementById('container-left');
    const sidebar = document.getElementById('sidebar');
    const widthToSubstract = patt?.clientWidth;

    if (widthToSubstract && rectObj && sidebar) {
      this.imageLeftVal =
        rectObj.x - widthToSubstract - sidebar.clientWidth + 'px';
      this.imageTopVal = rectObj.y + 'px';
    }
  }

  initDrag() {
    const dragStart$ = fromEvent<MouseEvent>(
      this.documentImage.nativeElement,
      'mousedown'
    );
    const dragEnd$ = fromEvent<MouseEvent>(
      this.documentImage.nativeElement,
      'mouseup'
    );
    const drag$ = fromEvent<MouseEvent>(
      this.documentImage.nativeElement,
      'mousemove'
    ).pipe(takeUntil(dragEnd$));
    const dragEnter$ = fromEvent<MouseEvent>(
      this.documentImage.nativeElement,
      'dragenter'
    ).pipe(takeUntil(dragEnd$));

    const dragStartSub = dragStart$.subscribe((event) => {
      this.documentImage.nativeElement =
        document.getElementById('document-container');
      if (this.documentImage.nativeElement) {
        this.positon = {
          left: this.documentImage.nativeElement.scrollLeft,
          top: this.documentImage.nativeElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        };
        this.documentImage.nativeElement.style.cursor = 'grabbing';
        this.documentImage.nativeElement.style.userSelect = 'none';
      }

      const dragSub = drag$.subscribe((event) => {
        event.preventDefault();
        if (this.documentImage.nativeElement) {
          // How far the mouse has been moved
          const dx = event.clientX - this.positon.x;
          const dy = event.clientY - this.positon.y;

          // Scroll the element
          this.documentImage.nativeElement.scrollTop = this.positon.top - dy;
          this.documentImage.nativeElement.scrollLeft = this.positon.left - dx;
        }
      });
    });

    const dragEndSub = dragEnd$.subscribe((event) => {
      if (this.documentImage.nativeElement) {
        this.documentImage.nativeElement.style.cursor = 'grab';
        this.documentImage.nativeElement.style.removeProperty('user-select');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentImg'] && changes['documentImg'].currentValue) {
      this.documentImg = changes['documentImg'].currentValue;
    }
    if (changes['thumbnails'] && changes['thumbnails'].currentValue) {
      this.thumbnails = changes['thumbnails'].currentValue;
    }

    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
  }
}
