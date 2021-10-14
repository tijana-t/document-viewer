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
  thumbnails: Thumbnail[] = [{ id: '', src: '', show: false }];
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

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    //wait small amount of time before another request is called
    this.results$ = this.searchSubject
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((res: number) => {
        if (res) {
          this.scrollToPageNumber(res, true);
        }
      });

    this.pdfViewerService.pageInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.pageNumber = res.currentPage;
          this.previousPageNum = res.currentPage;
          this.oldPageNumber = res.currentPage;
          if (res.pages) this.thumbnails = res.pages;

          setTimeout(() => {
            this.scrollToPageNumber(this.pageNumber);
          }, 0);
        }
      });
  }

  ngAfterViewInit() {}

  //fires on input change
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

  //scrolls thumbnail container and updates thumb position
  scrollToPageNumber(pageNumber: number, isChangePage?: boolean) {
    const offsetTop = document.getElementById('img-' + pageNumber)?.offsetTop;
    this.thumbnailContainer?.nativeElement.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
    if (this.inputRange) {
      this.inputRange.nativeElement.value = pageNumber;
    }

    this.calculateThumbPosition();
    this.pdfViewerService.mainImg.next(
      this.thumbnails[this.pageNumber - 1].src
    );
    this.triggerTextLayer.emit({ pageNumber, pageChange: isChangePage });
  }

  //fires on thumbnail click
  changePage(pageNumber: number) {
    this.pageNumber = pageNumber;

    if (this.pageNumber !== this.oldPageNumber) {
      this.scrollToPageNumber(pageNumber, true);

      //remove textLayer and border elements on page change
      const textLayer = document.getElementsByClassName('textLayer')[0];
      if (textLayer) textLayer.remove();

      const borderElems: any = document.querySelectorAll('.border-intent');
      if (borderElems)
        borderElems.forEach((item: Element) => {
          item.remove();
        });
    }

    this.oldPageNumber = pageNumber;
  }

  // fires on wheel event
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

      // call only on thumb input change
      if (pageNumber) {
        this.scrollThumbnailContainer(
          this.thumbnailContainer.nativeElement,
          this.thumbnail.nativeElement,
          pageNumber
        );
      }
    }
  };

  scrollThumbnailContainer(
    container: HTMLElement,
    thumbnail: HTMLElement,
    pageNumber: number
  ) {
    if (pageNumber >= this.previousPageNum) {
      container.scrollTop += thumbnail.clientHeight;
    } else {
      container.scrollTop -= thumbnail.clientHeight;
    }
    this.previousPageNum = pageNumber;
  }

  ngOnDestroy(): void {
    this.results$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
