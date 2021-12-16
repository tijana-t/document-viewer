import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { DocumentViewerService } from '../document-viewer.service';
import { SearchResult } from '../_config/document-search.model';
import { DocumentConfig, ShowDocumentConfig } from '../_config/document.model';
import { Thumbnail } from '../_config/thumbnail.model';

declare var ResizeObserver: any;
@Component({
  selector: 'lib-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DocumentComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('documentCanvas') documentCanvas: any;
  documentImage: any;
  mainImg: string = '';
  mainImgOrginal: string = '';
  @ViewChild('docContainer') docImage: any;
  @Output('pageSearch') pageSearch = new EventEmitter();
  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  thumbnails: Thumbnail[] = [{ id: '', src: '' }];
  defaultDocConfig: DocumentConfig = { containerWidth: 0 };
  imageTopVal = '50%';
  imageLeftVal = '50%';
  maxContainerHeight = 0;
  maxContainerWidth = 0;
  positon = { top: 0, left: 0, x: 0, y: 0 };
  relativePosition = { top: 0, left: 0, bottom: 0, right: 0 };
  observer: any;
  destroy$ = new Subject();
  image = new Image();
  pageNumber: number = 1;
  subscriptions = new Subscription();
  activateTransImg = false;
  groupedByPage: any;
  noSearchItems = false;
  searchInit = 0;
  colapsSearchStatus = false;
  searchValueForDoc: string = '';
  scrollVisibleX: boolean = false;
  changeDocument: boolean = false;

  constructor(
    private docViewerService: DocumentViewerService,
    private ngZone: NgZone
  ) {
    this.subscriptions = this.docViewerService.mainImg
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: string) => {
        if (res) {
          this.docViewerService.docConfSubject.next({
            containerWidth: 0,
          });
          this.documentConfig.containerWidth = 0;
          this.mainImg = res + '?img=_cleaned_rotated';
          this.mainImgOrginal = res;
          this.docViewerService.fitToPage.next(true);
          this.docViewerService.changeDocSubject.next(false);
        }
      });

    this.subscriptions = this.docViewerService.searchValue.subscribe(
      (res: string) => {
        if (res) {
          this.searchValueForDoc = res;
        }
      }
    );

    this.subscriptions = this.docViewerService.zoomXStatus.subscribe(
      (res: boolean) => {
        this.scrollVisibleX = res;
      }
    );

    this.subscriptions = this.docViewerService.changeDocSubject.subscribe(
      (res: boolean) => {
        this.changeDocument = res;
      }
    );

    this.subscriptions = this.docViewerService.showOriginalDoc
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: ShowDocumentConfig) => {
        this.docViewerService.changeDocSubject.next(false);
      });

    this.docViewerService.pageNumberSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((page: any) => {
        if (page) {
          this.pageNumber = page;
        }
      });

    this.subscriptions = this.docViewerService.groupedByPageSubj
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          if (res.length > 0) {
            this.groupedByPage = res;
            this.noSearchItems = false;
          } else if (res.length === 0 && this.searchInit > 0) {
            this.groupedByPage = [];
            this.noSearchItems = true;
            setTimeout(() => {
              this.noSearchItems = false;
            }, 0);
          }
        } else {
          this.groupedByPage = [];
        }
        this.searchInit = 1;
      });
  }

  ngOnInit(): void {}

  sendSearchObj(pageSearch: SearchResult) {
    this.colapsSearchStatus = !this.colapsSearchStatus;
    this.pageSearch.next({
      pageSearch: [pageSearch],
      pageNumber: pageSearch.pageNums[0],
    });
  }

  imageError(event: Event) {
    console.log('EROR: ', event);
  }

  onImageLoaded(event: any) {
    if (event && event.target) {
      if (
        event.path[0].naturalHeight !== 1 &&
        event.path[0].naturalWidth !== 1
      ) {
        this.triggerTextLayer.emit({ pageNumber: this.pageNumber });
      }
    }
  }

  triggerTextLayerCreation(event: Event) {
    //this.triggerTextLayer.emit(event);
  }

  setTransImgPosition(number: number) {
    const outerCont = document.getElementById('outer-cont');
    const documentImage = document.getElementById('docImg');

    if (documentImage && outerCont) {
      const rectObj: DOMRect = documentImage.getBoundingClientRect();
      const rectParent: DOMRect = outerCont.getBoundingClientRect();

      this.relativePosition = {
        top: rectObj.top - rectParent.top,
        left: rectObj.left - rectParent.left,
        bottom: rectObj.bottom - rectParent.bottom,
        right: rectObj.right - rectParent.right,
      };

      this.ngZone.run(() => {
        this.imageLeftVal = this.relativePosition.left + 'px';
        this.imageTopVal = this.relativePosition.top + 'px';
      });
    }
    this.docViewerService.lineStatus.next(true);
  }

  scrollToCenter() {
    /* const parentElement = document.getElementById('document-container');
    const childElement = document.getElementById('document-page');
    let centerY = 0;
    let centerX = 0;
    if (parentElement && childElement) {
      centerY = Math.abs(
        (parentElement.clientHeight - childElement.clientHeight) / 2
      );
      centerX = Math.abs(
        (parentElement.clientWidth - childElement.clientWidth) / 2
      );
      parentElement.scrollTo(centerX, centerY);
    } */
  }

  findSearchItemIn(sentence: string) {
    let newTextVal = sentence;

    const indexesPosition = this.getIndicesOf(
      this.searchValueForDoc,
      sentence,
      false
    );
    const tmpSorted = indexesPosition.sort((a, b) =>
      a.start < b.start ? 1 : -1
    );
    for (const indexObj of tmpSorted) {
      newTextVal = this.insert(newTextVal, '</span>', indexObj.end);
      newTextVal = this.insert(
        newTextVal,
        `<span class="selected-search">`,
        indexObj.start
      );
    }

    return newTextVal;
  }

  // get start and end indexes of found words in sentence
  getIndicesOf(searchStr: string, str: string, caseSensitive: boolean) {
    let searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    let startIndex = 0;
    let index;
    let indices = [];
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push({ start: index, end: index + searchStr.length });
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  // insert substring at specific position in main string
  insert(mainString: string, insString: string, pos: number) {
    return mainString.slice(0, pos) + insString + mainString.slice(pos);
  }

  ngOnDestroy(): void {
    this.groupedByPage = [];
    this.noSearchItems = false;
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
    this.observer.unobserve(document.querySelector('#container-right'));
    this.observer.unobserve(document.querySelector('#document-page'));
  }

  ngAfterViewInit() {
    this.defaultDocConfig = { ...this.documentConfig };
    // this.initDrag();
    const docContainer = document.getElementById('document-container');
    this.observer = new ResizeObserver((entries: any) => {
      for (const entry of entries) {
        if (entry.target.id === 'container-right') {
          const widthSet = Math.floor(
            entries[0].contentRect.width - 60 - 200
          ).toString();
          if (docContainer) {
            docContainer.style.width = widthSet + 'px';
          }
        }
        this.scrollToCenter();
        this.setTransImgPosition(2);
      }
    });

    this.observer.observe(document.querySelector('#container-right'));
    this.observer.observe(document.querySelector('#document-page'));
  }

  scrollEvent(event: Event, documentImage: any) {
    this.setTransImgPosition(4);
  }

  initDrag() {
    const dragStart$ = fromEvent<MouseEvent>(
      this.docImage.nativeElement,
      'mousedown'
    );
    const dragEnd$ = fromEvent<MouseEvent>(
      this.docImage.nativeElement,
      'mouseup'
    );
    const drag$ = fromEvent<MouseEvent>(
      this.docImage.nativeElement,
      'mousemove'
    ).pipe(takeUntil(dragEnd$));
    const dragEnter$ = fromEvent<MouseEvent>(
      this.docImage.nativeElement,
      'dragenter'
    ).pipe(takeUntil(dragEnd$));

    const dragStartSub = dragStart$.subscribe((event) => {
      if (this.docImage.nativeElement) {
        this.positon = {
          left: this.docImage.nativeElement.scrollLeft,
          top: this.docImage.nativeElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        };
        this.docImage.nativeElement.style.cursor = 'grabbing';
        this.docImage.nativeElement.style.userSelect = 'none';
      }

      const dragSub = drag$.subscribe((event) => {
        event.preventDefault();
        if (this.docImage.nativeElement) {
          // How far the mouse has been moved
          const dx = event.clientX - this.positon.x;
          const dy = event.clientY - this.positon.y;

          // Scroll the element
          this.docImage.nativeElement.scrollTop = this.positon.top - dy;
          this.docImage.nativeElement.scrollLeft = this.positon.left - dx;
        }
      });
    });

    const dragEndSub = dragEnd$.subscribe((event) => {
      if (this.docImage.nativeElement) {
        this.docImage.nativeElement.style.cursor = 'grab';
        this.docImage.nativeElement.style.removeProperty('user-select');
      }
    });

    this.subscriptions.add(dragStartSub);
    this.subscriptions.add(dragEndSub);
    this.setTransImgPosition(5);
  }

  colapsSearch() {
    this.colapsSearchStatus = !this.colapsSearchStatus;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.groupedByPage = [];
      this.noSearchItems = false;
      this.documentConfig = changes['documentConfig'].currentValue;
    }
    this.setTransImgPosition(6);
  }
}
