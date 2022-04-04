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
import { DocumentViewerService } from '../document-viewer.service';
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
  isChangePage: boolean = false;
  originalImgExtension?: string;
  mainImgExtension?: string;
  changeActivated: boolean = false;

  constructor(private docViewerService: DocumentViewerService) {
    this.subscriptions.add(
      this.docViewerService.importantPages.subscribe((res: number[]) => {
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
      .pipe(debounceTime(800))
      .subscribe((res: number) => {
        if (Number.isInteger(res)) {
          if (this.pageNumber !== this.oldPageNumber) {
            if (this.pageNumber > this.thumbnails.length) {
              this.pageNumber = this.thumbnails.length;
              if (this.pageNumber !== this.oldPageNumber) {
                this.triggerPageChange(this.pageNumber);
              }
            } else if (this.pageNumber < 1) {
              this.pageNumber = 1;
              if (this.pageNumber !== this.oldPageNumber) {
                this.triggerPageChange(this.pageNumber);
              }
            } else {
              this.triggerPageChange(this.pageNumber);
            }
          }
        } else {
          // not a number
          this.pageNumber = this.oldPageNumber;
        }
      });

    this.docViewerService.pageInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: {
          pages: [{ src?: string; id: string; isImportant?: boolean }];
          currentPage: number;
          originalImgExtension?: string;
          mainImgExtension?: string;
        }) => {
          if (res) {
            this.pageNumber = res.currentPage;
            this.previousPageNum = res.currentPage;
            this.oldPageNumber = res.currentPage;

            if (res.originalImgExtension) {
              this.originalImgExtension = res.originalImgExtension;
            }
            if (res.mainImgExtension) {
              this.mainImgExtension = res.mainImgExtension;
            }
            this.docViewerService.pageNumberSubject.next(res.currentPage);
            if (res.pages) this.thumbnails = res.pages;
            //do not call, because textLayer is activated already from changePage()
            if (!this.changeActivated) {
              setTimeout(() => {
                this.isChangePage = false;
                this.docViewerService.pageChange.next(false);
                this.scrollToPageNumber(this.pageNumber);
              }, 0);
            }

            this.changeActivated = false;
          }
        }
      );
  }

  ngAfterViewInit() {}
  searchPage(pageNumber: number) {
    this.searchSubject.next(pageNumber);
  }

  triggerPageChange(res: number) {
    if (res) {
      this.clearTextLayer();
      const thumbnail = this.thumbnails.find(
        (thumb) => thumb.id == res.toString()
      );
      if (thumbnail && thumbnail.hasSearchedText) {
        this.docViewerService.activateSearch.next(res);
      } else {
        this.docViewerService.activateSearch.next(0);
      }
      this.isChangePage = true;
      this.docViewerService.pageNumberSubject.next(res);
      this.docViewerService.pageChange.next(true);
      this.scrollToPageNumber(res, true);
      this.oldPageNumber = res;
    }
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
    this.docViewerService.mainImgInfo.next({
      mainImg,
      originalImgExtension: this.originalImgExtension,
      mainImgExtension: this.mainImgExtension,
    });
    this.triggerTextLayer.emit({
      pageNumber: this.pageNumber,
      pageChange: isChangePage,
    });
  }

  //fires on thumbnail click
  changePage(
    pageNumber: number,
    changeActivation: boolean,
    thumbnail: Thumbnail
  ) {
    this.changeActivated = changeActivation;
    this.pageNumber = pageNumber;
    if (this.pageNumber !== this.oldPageNumber) {
      this.docViewerService.pageNumberSubject.next(pageNumber);
      this.isChangePage = true;
      this.docViewerService.pageChange.next(true);
      this.scrollToPageNumber(pageNumber, true);
      this.clearTextLayer();
    }
    this.oldPageNumber = pageNumber;
    this.changeActivated = false;
    if (thumbnail.hasSearchedText) {
      this.docViewerService.activateSearch.next(pageNumber);
    } else {
      this.docViewerService.activateSearch.next(0);
    }
  }

  clearTextLayer() {
    this.docViewerService.lineStatus.next(false);
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

    const detectronElems: any = document.querySelectorAll(
      '.detectron-container'
    );
    if (detectronElems) {
      detectronElems.forEach((item: Element) => {
        item.remove();
      });
    }
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
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
