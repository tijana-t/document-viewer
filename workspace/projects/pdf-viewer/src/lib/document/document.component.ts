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

declare var ResizeObserver: any;
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
  @Input('documentImg') documentImg: string = '';
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
    containerHeight: 0,
  };
  thumbnails: Thumbnail[] = [{ id: '', src: '' }];
  defaultDocConfig: DocumentConfig = { containerWidth: 0, containerHeight: 0 };
  imageTopVal = '50%';
  imageLeftVal = '50%';
  maxContainerHeight = 0;
  maxContainerWidth = 0;
  positon = { top: 0, left: 0, x: 0, y: 0 };
  observer: any;
  destroy$ = new Subject();
  image = new Image();
  pageNumber: number = 1;
  subscriptions = new Subscription();
  activateTransImg = false;
  constructor(private pdfViewerService: PdfViewerService) {
    this.pdfViewerService.pageInfo
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: { pages: Thumbnail[]; currentPage: number }) => {
        if (res) {
          this.pageNumber = res.currentPage;
          if (res.pages) this.thumbnails = res.pages;

          if (this.thumbnails && this.thumbnails.length !== 0) {
            this.documentImg = this.thumbnails[this.pageNumber - 1].src;
          }
        }
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
    this.observer.unobserve(document.querySelector('#container-right'));
  }
  ngAfterViewInit() {
    this.defaultDocConfig = { ...this.documentConfig };
    this.initDrag();

    const docContainer = document.getElementById('document-container');
    this.observer = new ResizeObserver((entries: any) => {
      const widthSet = Math.floor(
        entries[0].contentRect.width - 60 - 200
      ).toString();
      if (docContainer) {
        docContainer.style.width = widthSet + 'px';
      }
    });

    this.observer.observe(document.querySelector('#container-right'));
  }

  scrollEvent(event: Event, documentImage: any) {
    const outerCont = document.getElementById('outer-cont');
    if (outerCont) outerCont.style.position = 'static';

    if (documentImage) {
      // needs refactoring
      const rectObj: DOMRect =
        documentImage.nativeElement.getBoundingClientRect();
      const patt = document.getElementById('container-left');
      const sidebar = document.getElementById('sidebar');
      const widthToSubstract = patt?.clientWidth;

      if (widthToSubstract && rectObj && sidebar) {
        this.imageLeftVal =
          rectObj.x - widthToSubstract - sidebar.clientWidth + 'px';
        this.imageTopVal = rectObj.y + 'px';
      }
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

    this.subscriptions.add(dragStartSub);
    this.subscriptions.add(dragEndSub);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
  }
}
