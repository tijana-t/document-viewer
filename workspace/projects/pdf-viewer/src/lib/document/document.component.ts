import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
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

    const rectObj: DOMRect = documentImage.getBoundingClientRect();
    const patt = document.getElementById('container-left');
    const widthToSubstract = patt?.clientWidth;

    if (widthToSubstract && rectObj) {
      this.imageLeftVal = rectObj.x - widthToSubstract - 175 + 'px';
      this.imageTopVal = rectObj.y + 'px';
    }
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
