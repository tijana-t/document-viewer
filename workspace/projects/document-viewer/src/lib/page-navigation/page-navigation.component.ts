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
import { debounceTime, takeUntil, skip } from 'rxjs/operators';
import { DocumentViewerService } from '../document-viewer.service';
import { NavigationConfig } from '../_config/page-navigation.model';
import { Thumbnail } from '../_config/thumbnail.model';
import { DocumentActions } from '../_config/document-actions.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
  @ViewChild('thumbSettings') thumbSettings: any;

  thumbnails: Thumbnail[] = [{ id: '', src: '', show: false }];
  destroy$ = new Subject();
  showMyElement: boolean = false;

  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  @Output('separateDocumentEvent') separateDocumentEvent = new EventEmitter();
  @Output('reorderDocumentEvent') reorderDocumentEvent = new EventEmitter();
  @Output('downloadDocumentEvent') downloadDocumentEvent = new EventEmitter();
  @Output('triggerPagesReorder') triggerPagesReorder = new EventEmitter();

  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    informationHelp: '',
    downloadPdfPlain: '',
    separateMergedDoc: '',
    reorderPages: '',
  };
  @Input('documentsList') documentsList: any;
  @Input('singleDocument') singleDocument: any;

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
  topCorner = 0;
  showThumbSettings: boolean = false;
  rightCorner = 0;
  thumbnailInfo: Thumbnail = { fileId: '', id: '', originalName: '' };
  multipleDocsThumbs: any = [];
  multipleDocs: boolean = false;
  openedDoc: any;
  docIndexMapping: {
    fileId: string;
    indexes: { prev: number; curr: number }[];
  }[] = [];
  openedDocColor: string | undefined = '';

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
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(
        (res: {
          multipleDocs?: boolean;
          pages: any;
          currentPage: number;
          originalImgExtension?: string;
          mainImgExtension?: string;
          colorValue?: string;
        }) => {
          if (res && (res.currentPage || res.pages)) {
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
            if (res.pages && !res.multipleDocs) {
              this.multipleDocs = false;
              this.thumbnails = res.pages;
              this.multipleDocsThumbs = [1];
            } else if (res.pages && res.multipleDocs) {
              this.multipleDocs = true;
              this.multipleDocsThumbs = res.pages;
              this.thumbnails.shift();
              this.multipleDocsThumbs.forEach((doc: any) => {
                this.thumbnails.push(...doc);
              });
            }

            //do not call, because textLayer is activated already from changePage()
            if (!this.changeActivated) {
              setTimeout(() => {
                this.isChangePage = false;
                this.docViewerService.pageChange.next(false);
                this.scrollToPageNumber(3, this.pageNumber);
              }, 0);
            }

            this.changeActivated = false;
          }
        }
      );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentsList'] && changes['documentsList'].currentValue) {
      this.documentsList = changes['documentsList'].currentValue;
    }
    if (changes['singleDocument'] && changes['singleDocument'].currentValue) {
      this.singleDocument = changes['singleDocument'].currentValue;
    }
  }

  showSettings(image: Thumbnail, fileId: string) {
    this.thumbnailInfo = image;
    this.showThumbSettings = true;
    const settings = document.getElementById('settings-' + fileId);
    if (settings) {
      settings.style.visibility = 'visible';
    }
  }

  hideSettings(fileId: string) {
    const settings = document.getElementById('settings-' + fileId);
    if (settings) {
      settings.style.visibility = 'hidden';
    }
  }

  reorderPages(fileId: string) {
    let mappedPages;
    if (this.multipleDocs) {
      mappedPages = this.openedDoc.file['newMappedPages'];
    } else {
      mappedPages = this.singleDocument.file['newMappedPages'];
    }
    this.triggerPagesReorder.emit({
      fileId,
      mappedPages,
    });
  }

  checkReorder(fileId: string) {
    let singleDoc;
    if (this.multipleDocs) {
      singleDoc = this.documentsList.find(
        (doc: any) => doc.file._id === fileId
      );
    } else {
      singleDoc = this.singleDocument;
    }

    if (singleDoc) {
      if (
        singleDoc.file['newMappedPages'] &&
        singleDoc.file['newMappedPages'].length !== 0 &&
        singleDoc.file.mappedPages &&
        singleDoc.file.mappedPages.length !== 0
      ) {
        // if both arrays exist, compare similarity
        if (
          JSON.stringify(singleDoc.file.mappedPages) ===
          JSON.stringify(singleDoc.file['newMappedPages'])
        ) {
          return false;
        } else {
          return true;
        }
        // check new mappedPages with normal order
      } else if (
        singleDoc.file['newMappedPages'] &&
        singleDoc.file['newMappedPages'].length !== 0 &&
        !singleDoc.file.mappedPages
      ) {
        let arr = [];
        const total = singleDoc.numberOfPages;
        for (let i = 0; i <= total; i++) {
          arr.push(i + 1);
        }
        if (
          JSON.stringify(arr) ===
          JSON.stringify(singleDoc.file['newMappedPages'])
        ) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  drop(event: CdkDragDrop<string[]>, innerImgArray: any[], docIndex: number) {
    moveItemInArray(innerImgArray, event.previousIndex, event.currentIndex);
    this.openedDoc = this.documentsList.find(
      (doc: any) => doc.file._id === innerImgArray[0].fileId
    );
    this.openedDoc.file['newMappedPages'] = innerImgArray.map((item) =>
      Number(item.id)
    );
  }

  dropSingleDoc(event: CdkDragDrop<string[]>, innerImgArray: any[]) {
    moveItemInArray(innerImgArray, event.previousIndex, event.currentIndex);

    this.singleDocument.file['newMappedPages'] = innerImgArray.map((item) =>
      Number(item.id)
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
      this.scrollToPageNumber(1, res, true);
      this.oldPageNumber = res;
    }
  }

  //scrolls thumbnail container and updates thumb position
  scrollToPageNumber(num: number, pageNumber: number, isChangePage?: boolean) {
    console.log({ pageNumber }, document.getElementById('img-' + pageNumber));
    const offsetTop = document.getElementById('img-' + pageNumber)?.offsetTop;
    this.thumbnailContainer?.nativeElement.scrollTo({
      top: offsetTop,
      behavior: 'auto',
    });
    if (this.inputRange) {
      this.inputRange.nativeElement.value = this.pageNumber;
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
      colorValue: this.thumbnails[this.pageNumber - 1].thumbColor,
    });
    this.openedDocColor = this.thumbnails[this.pageNumber - 1].thumbColor;
    this.triggerTextLayer.emit({
      pageNumber: this.pageNumber,
      pageChange: isChangePage,
      fileId: this.thumbnails[this.pageNumber - 1].fileId,
      thumbId: +this.thumbnails[this.pageNumber - 1].id,
    });
  }

  separateDocument(documentId?: string) {
    this.showThumbSettings = false;
    this.separateDocumentEvent.emit(documentId);
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
      this.scrollToPageNumber(2, this.pageNumber, true);
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

  getPageNum(docIndex: number) {
    let pageNum = 0;

    for (const [index, doc] of this.multipleDocsThumbs.entries()) {
      if (index === docIndex) {
        return pageNum;
      }
      pageNum += this.getLength(doc);
    }

    return 0;
  }

  getLength(arr: any) {
    if (arr) {
      return arr.length;
    } else {
      return 0;
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
    // console.log({ child });
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
          //add offset if we have merged documents
          let offset = 0;
          if (this.multipleDocs) {
            offset = -26;
          }

          // we're near the top of the list
          container.scrollTop += scrollTop + offset;
        } else {
          // we're near the bottom of the list
          container.scrollTop += scrollBot + 30;
        }
      }
    }
    this.previousPageNum = pageNumber;
  }

  downloadDocument(
    fileId: string | undefined,
    fileName: string | undefined,
    originalName: string | undefined
  ) {
    this.downloadDocumentEvent.emit({ fileId, fileName, originalName });
  }

  reorderDocument(thumb: Thumbnail, offsetNum: number) {
    // debugger;
    const filesInfo = [];
    for (const [index, doc] of this.documentsList.entries()) {
      if (doc.file._id === thumb.fileId) {
        //going down
        if (offsetNum === 1) {
          doc.file.mergedDocOrder += 1;
          this.documentsList[index + 1].file.mergedDocOrder -= 1;
        } else {
          //going up
          doc.file.mergedDocOrder -= 1;
          this.documentsList[index - 1].file.mergedDocOrder += 1;
        }
      }

      filesInfo.push({
        fileId: doc.file._id,
        mergedDocOrder: doc.file.mergedDocOrder,
      });
    }

    this.reorderDocumentEvent.emit(filesInfo);
  }

  ngOnDestroy(): void {
    this.results$.unsubscribe();
    this.destroy$.next(null);
    this.destroy$.complete();

    this.showThumbSettings = false;
  }
}
