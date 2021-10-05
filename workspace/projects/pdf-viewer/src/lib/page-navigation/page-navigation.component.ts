import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PdfViewerService } from '../pdf-viewer.service';
import { NavigationConfig } from '../_config/page-navigation.model';
import { Thumbnail } from '../_config/thumbnail.model';

@Component({
  selector: 'lib-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef | undefined;
  @ViewChild('thumbnailImage') thumbnail: ElementRef | undefined;
  @ViewChild('bubbleWrap') bubbleWrap: ElementRef | undefined;
  @ViewChild('inputRange') inputRange: ElementRef | undefined;
  @ViewChild('bubbleValue') bubbleValue: ElementRef | undefined;
  @ViewChild('pageInput') pageInput: ElementRef | undefined;
  @Input('thumbnails') thumbnails: Thumbnail[] = [
    { id: '', src: '', show: false },
  ];
  destroy$ = new Subject();
  showMyElement: boolean = false;

  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  searchSubject = new Subject<number>();
  results$ = new Subscription();

  navigationConfig: NavigationConfig = {
    imageMargin: 20,
    containerHeight: '85vh',
  };
  oldPageNumber: number = 1;
  pageNumber: number = 1;
  previousPageNum: number = 1;
  initialLoad = true;

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    //wait small amount of time before another request is called
    this.results$ = this.searchSubject
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((res: number) => {
        if (res) {
          this.scrollToPageNumber(res);
        }
      });

    this.pdfViewerService.pageNumberSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.pageNumber = res;
        }
      });

    this.pdfViewerService.pageInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.pageNumber = res.currentPage;
          if (this.initialLoad) {
            setTimeout(() => {
              this.scrollToPageNumber(this.pageNumber);
            }, 0);
          }
        }
      });
  }

  ngAfterViewInit() {}

  searchPage(pageNumber: number) {
    //check if pageNumber is more than total, or less than zero
    if (
      pageNumber >= this.thumbnails.length &&
      this.thumbnails.length - 1 > 0
    ) {
      this.pageNumber = this.thumbnails.length;
    } else if (pageNumber < 1) {
      this.pageNumber = 1;
    } else {
      this.pageNumber = pageNumber;
    }
    this.searchSubject.next(this.pageNumber);
  }

  scrollToPageNumber(pageNumber: number) {
    this.initialLoad = false;

    const offsetTop = document.getElementById('img-' + pageNumber)?.offsetTop;
    this.thumbnailContainer?.nativeElement.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
    if (this.inputRange) {
      this.inputRange.nativeElement.value = pageNumber;
    }

    this.calculateThumbPosition();
    this.pdfViewerService.pageInfo.next({
      currentPage: pageNumber,
      pages: this.thumbnails,
    });
    this.triggerTextLayer.emit({ pageNumber });
  }

  changePage(pageNumber: number) {
    console.log('CHANGE PAGE');
    this.pageNumber = pageNumber;

    if (this.pageNumber !== this.oldPageNumber) {
      this.scrollToPageNumber(pageNumber);

      //remove textLayer if exists
      const textLayer = document.getElementsByClassName('textLayer')[0];
      if (textLayer) textLayer.remove();
      // this.triggerTextLayer.emit({ pageNumber });
    }
    this.oldPageNumber = pageNumber;
  }

  scrollThumbnail(event: WheelEvent, inputRange: any) {
    const inputNumber = parseInt(inputRange.value, 10);
    if (event.deltaY < 0 && inputNumber !== 1) {
      // scrolling up
      inputRange.value = (inputNumber - 1).toString();
      this.calculateThumbPosition(parseInt(inputRange.value, 10));
    } else if (event.deltaY > 0 && inputNumber !== this.thumbnails.length) {
      //  scrolling down
      inputRange.value = (parseInt(inputRange.value, 10) + 1).toString();
      this.calculateThumbPosition(parseInt(inputRange.value, 10));
    }
  }

  calculateThumbPosition = (pageNumber?: number) => {
    if (
      this.inputRange &&
      this.bubbleValue &&
      this.thumbnailContainer &&
      this.thumbnail &&
      this.bubbleWrap
    ) {
      const newValue = Number(
          ((this.inputRange.nativeElement.value -
            this.inputRange.nativeElement.min) *
            100) /
            (this.inputRange.nativeElement.max -
              this.inputRange.nativeElement.min)
        ),
        newPosition = 10 - newValue * 0.1;
      this.bubbleValue.nativeElement.innerText =
        this.inputRange.nativeElement.value;
      this.bubbleWrap.nativeElement.style.top = `calc(${newValue}% + (${newPosition}px))`;

      // call only on input change
      if (pageNumber) {
        this.scrollThumbnailContainer(
          this.thumbnailContainer.nativeElement,
          this.thumbnail.nativeElement,
          pageNumber
        );
      }
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['thumbnails'] && changes['thumbnails'].currentValue) {
      this.thumbnails = changes['thumbnails'].currentValue;
    }
  }

  scrollThumbnailContainer(
    container: HTMLElement,
    thumbnail: HTMLElement,
    pageNumber: number
  ) {
    if (pageNumber >= this.oldPageNumber) {
      container.scrollTop += thumbnail.clientHeight;
    } else {
      container.scrollTop -= thumbnail.clientHeight;
    }

    this.oldPageNumber = pageNumber;
  }

  ngOnDestroy(): void {
    this.results$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
