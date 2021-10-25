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
  scrolling = false;
  timeout: any = null;
  subscriptions = new Subscription();
  importantPages: number[] = [0];

  constructor(private pdfViewerService: PdfViewerService) {
    this.subscriptions.add(
      this.pdfViewerService.importantPages.subscribe((res: number[]) => {
        this.importantPages = res;
        for (const thumb of this.thumbnails) {
          if (this.importantPages.find((page) => page === parseInt(thumb.id))) {
            thumb.hasSearchedText = true;
          } else {
            thumb.hasSearchedText = false;
          }
        }
      })
    );
  }

  ngOnInit(): void {
    //wait small amount of time before another request is called
    this.results$ = this.searchSubject
      .pipe(debounceTime(800), distinctUntilChanged())
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
  searchPage(pageNumber: number) {
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
      behavior: 'auto',
    });
    if (this.inputRange) {
      this.inputRange.nativeElement.value = pageNumber;
    }

    this.calculateThumbPosition();
    const mainImg = this.thumbnails[this.pageNumber - 1].src.replace(
      'thumb',
      'img'
    );
    this.pdfViewerService.mainImg.next(mainImg);
    this.triggerTextLayer.emit({ pageNumber, pageChange: isChangePage });
  }

  //fires on thumbnail click
  changePage(pageNumber: number, thumbnail: Thumbnail) {
    this.pageNumber = pageNumber;

    if (this.pageNumber !== this.oldPageNumber) {
      this.scrollToPageNumber(pageNumber, true);

      this.clearTextLayer();
    }
    this.oldPageNumber = pageNumber;
    if (thumbnail.hasSearchedText) {
      this.pdfViewerService.activateSearch.next(pageNumber);
    } else {
      this.pdfViewerService.activateSearch.next(0);
    }
  }

  clearTextLayer() {
    const borderElems: any = document.querySelectorAll('.border-intent');
    if (borderElems)
      borderElems.forEach((item: Element) => {
        item.remove();
      });

    const SpanElems: any = document.querySelectorAll('.gray-border');
    if (SpanElems)
      SpanElems.forEach((item: Element) => {
        item.remove();
      });
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
          pageNumber
        );
      }
    }
  };

  scrollThumbnailContainer(container: HTMLElement, pageNumber: number) {
    // Where is the parent on page
    var parentRect = container.getBoundingClientRect();
    // What can you see?
    var parentViewableArea = {
      height: container.clientHeight,
      width: container.clientWidth,
    };

    const child = document.getElementById('img-' + pageNumber);
    // Where is the child

    if (child) {
      var childRect = child.getBoundingClientRect();
      // Is the child viewable?
      var isViewable =
        childRect.top >= parentRect.top &&
        childRect.bottom <= parentRect.top + parentViewableArea.height;

      // if you can't see the child try to scroll parent
      if (!isViewable) {
        // Should we scroll using top or bottom? Find the smaller ABS adjustment
        const scrollTop = childRect.top - parentRect.top;
        const scrollBot = childRect.bottom - parentRect.bottom;
        if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
          // we're near the top of the list
          container.scrollTop += scrollTop;
        } else {
          // we're near the bottom of the list
          container.scrollTop += scrollBot + 30;
        }
      }
    }
    this.previousPageNum = pageNumber;
  }

  ngOnDestroy(): void {
    this.results$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
