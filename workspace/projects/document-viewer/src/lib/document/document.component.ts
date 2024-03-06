import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
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
import { environment } from '../_environments/environment';
import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/angular';

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
  @Input('createdAt') createdAt = '';
  @Output('naturalDimensions') naturalDimensions = new EventEmitter();
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
  isChangePage: boolean = true;
  showDebugger: boolean = false;
  colorValue?: string;

  constructor(
    private docViewerService: DocumentViewerService,
    private ngZone: NgZone
  ) {
    //initialize sentry
    //sentry for production
    if (environment.production) {
      Sentry.init({
        dsn: 'https://b7b6b615b90b489c9ee665fe7a1841eb@o1092278.ingest.sentry.io/6212951',
        integrations: [
          new Integrations.BrowserTracing({
            tracingOrigins: [
              'https://demo-v3.uhurasolutions.com/',
              'https://apidemo-v3.uhurasolutions.com/',
            ],
            routingInstrumentation: Sentry.routingInstrumentation,
          }),
        ],
        defaultIntegrations: false,
        tracesSampleRate: 1.0,
        environment: 'production',
        release: '3.0.2',
      });
    } else {
      //sentry for development
      Sentry.init({
        dsn: 'https://b7b6b615b90b489c9ee665fe7a1841eb@o1092278.ingest.sentry.io/6212951',
        integrations: [
          new Integrations.BrowserTracing({
            tracingOrigins: ['localhost:4200', 'localhost:3333'],
            routingInstrumentation: Sentry.routingInstrumentation,
          }),
        ],
        defaultIntegrations: false,
        tracesSampleRate: 1.0,
        environment: 'development',
        release: '3.0.2',
      });
    }

    this.subscriptions = this.docViewerService.mainImgInfo
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(
        (res: {
          mainImg: string;
          originalImgExtension?: string;
          mainImgExtension?: string;
          colorValue?: string;
        }) => {
          if (res) {
            console.log('res document', res);
            this.docViewerService.docConfSubject.next({
              containerWidth: 0,
            });
            this.documentConfig.containerWidth = 0;
            //main img url
            if (
              res.mainImgExtension !== undefined &&
              res.mainImg !== undefined
            ) {
              this.mainImg = res.mainImg + '&img=' + res.mainImgExtension;
            }
            //original img
            if (res.originalImgExtension !== undefined) {
              if (res.mainImg !== undefined) {
                this.mainImgOrginal =
                  res.mainImg + '&img=' + res.originalImgExtension;
              }
            } else {
              this.mainImgOrginal =
                this.mainImg !== undefined ? this.mainImg : res.mainImg;
            }

            // console.log('mainImgOrginal', this.mainImgOrginal);

            this.colorValue = res.colorValue;
            this.docViewerService.fitToPage.next(true);
            this.docViewerService.changeDocSubject.next(false);
          }
        }
      );

    this.subscriptions = this.docViewerService.searchValue.subscribe(
      (res: string) => {
        if (res) {
          this.searchValueForDoc = res;
        }
      }
    );

    this.subscriptions.add(
      this.docViewerService.mainDocColor.subscribe((res: any) => {
        this.colorValue = res;
      })
    );

    this.subscriptions = this.docViewerService.showDebugger.subscribe(
      (res: boolean) => {
        this.showDebugger = res;
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

    this.docViewerService.pageChange
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: boolean) => {
        this.isChangePage = res;
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
            this.colapsSearchStatus = false;
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calculateContainerWidth();
  }

  ngOnInit(): void {}

  sendSearchObj(pageSearch: SearchResult) {
    this.colapsSearchStatus = !this.colapsSearchStatus;
    this.pageSearch.emit({
      pageSearch: [pageSearch],
      pageNumber: pageSearch.pageNums[0],
    });
  }

  imageError(event: any) {
    if (event.target) {
      event.target?.classList.add('d-none');
    }
    console.log('EROR: ', event);
  }

  onImageLoaded(event: any) {
    if (event && event.target) {
      if (
        event.path &&
        event.path[0].naturalHeight !== 1 &&
        event.path[0].naturalWidth !== 1
      ) {
        this.naturalDimensions.emit({
          imgWidth: event.path[0].naturalWidth,
          imgHeight: event.path[0].naturalHeight,
        });
      }
    }
  }

  setTransImgPosition(initalSetting?: boolean) {
    const outerCont = document.getElementById('outer-cont');
    let documentImage;
    if (this.mainImgOrginal !== '') {
      documentImage = document.getElementById('docImgOrginal');
    } else {
      documentImage = document.getElementById('docImg');
    }

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
    if (this.isChangePage) {
      this.docViewerService.lineStatus.next(false);
    } else {
      this.docViewerService.lineStatus.next(true);
    }
    //this.docViewerService.lineStatus.next(true)
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
    this.destroy$.next(null);
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.defaultDocConfig = { ...this.documentConfig };
    this.calculateContainerWidth();
  }

  calculateContainerWidth() {
    const docContainer = document.querySelector('#document-container')!;
    const containerRight = document.querySelector('#container-right');
    if (containerRight) {
      const widthSet = Math.floor(
        containerRight.clientWidth - 60 - 300
      ).toString();

      let container = docContainer as HTMLElement;
      if (container) {
        container.style.width = widthSet + 'px';
      }
      this.scrollToCenter();
      this.setTransImgPosition(true);
    }
  }

  scrollEvent(event: Event, documentImage: any) {
    this.setTransImgPosition();
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
    this.setTransImgPosition();
  }

  colapsSearch() {
    this.colapsSearchStatus = !this.colapsSearchStatus;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      //if search is opened, collapse it
      this.colapsSearchStatus = true;
      this.documentConfig = changes['documentConfig'].currentValue;
    }
    if (changes['createdAt'] && changes['createdAt'].currentValue) {
      this.createdAt = changes['createdAt'].currentValue;
    }
    setTimeout(() => {
      this.setTransImgPosition();
    }, 0);
  }
}
