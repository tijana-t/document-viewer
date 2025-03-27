import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
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
// import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild('thumbContainer') thumbContainer: ElementRef | undefined;
  @ViewChild('thumbSettings') thumbSettings: any;

  thumbnails: Thumbnail[] = [{ id: '', src: '', show: false }];
  destroy$ = new Subject();
  showMyElement: boolean = false;

  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  @Output('separateDocumentEvent') separateDocumentEvent = new EventEmitter();
  @Output('reorderDocumentEvent') reorderDocumentEvent = new EventEmitter();
  @Output('downloadDocumentEvent') downloadDocumentEvent = new EventEmitter();
  @Output('triggerPagesReorder') triggerPagesReorder = new EventEmitter();
  @Output('triggerSplitDocument') triggerSplitDocument = new EventEmitter();
  @Output('triggerMergeMethod') triggerMergeMethod =  new EventEmitter();
  @Output('openTriggeredEmittrt') openTriggeredEmittert = new EventEmitter();

  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    informationHelp: '',
    downloadPdfPlain: '',
    separateMergedDoc: '',
    reorderPages: '',
    undoArrow: '',
    split: '',
    mergeDocs: ''
  };
  @Input('documentsList') documentsList: any;
  @Input('singleDocument') singleDocument: any;
  @Input('reorderFinished') reorderFinished: boolean = false;
  @Input('triggeredModalIsOpen') triggeredModalIsOpen: any;
  searchSubject = new Subject<number>();
  results$ = new Subscription();
  thumbsStates: any[] = [];
  reorderStates: any[] = [];

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
  thumbnailInfo: Thumbnail = {
    fileId: '',
    id: '',
    originalName: '',
    showReorder: false,
  };
  docColorPallete: string[] = [];
  multipleDocsThumbs: any = [];
  mergeFilePairsState: any[] = [];
  multipleDocs: boolean = false;
  openedDoc: any;
  docIndexMapping: {
    fileId: string;
    indexes: { prev: number; curr: number }[];
  }[] = [];
  openedDocColor: string | undefined = '';
  activeThumbnail: Thumbnail = { fileId: '', id: '', originalName: '' };
  activeThumbnailIndex: number = 0;
  top: number | undefined = 0;
  triggered: boolean = false;
  triggerReorderMethod = new Subject<boolean>();
  thumb: Thumbnail = { fileId: '', id: '', originalName: '' };
  offsetNum: number = 0;
  docIndex: number = 0;
  triggerSeparateMethod = new Subject<boolean>();
  fileId: string | undefined = '';
  reload = false;
  mergeFilePairs: Object[] = [];
  constructor(
    private docViewerService: DocumentViewerService // config: NgbDropdownConfig
  ) {
    // config.placement = 'bottom-end';
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
    this.subscriptions.add(
      this.triggerReorderMethod.subscribe((isTriggered) => {
        if (isTriggered) {
          let newPosition = 0;
          let temp = [...this.multipleDocsThumbs[this.docIndex]];
          const filesInfo = [];
          for (const [index, doc] of this.documentsList.entries()) {
            if (doc.file._id === this.thumb.fileId) {
              //going down
              if (this.offsetNum === 1) {
                newPosition = this.docIndex + 1;
              } else {
                //going up
                newPosition = this.docIndex - 1;
              }
            }
          }

          let newPos = [...this.multipleDocsThumbs[newPosition]];
          this.multipleDocsThumbs[this.docIndex] = newPos;
          this.multipleDocsThumbs[newPosition] = temp;

          for (const [index, docArr] of this.multipleDocsThumbs.entries()) {
            filesInfo.push({
              fileId: docArr[0].fileId,
              mergedDocOrder: index + 1,
            });
          }

          this.thumbnails = [];
          this.multipleDocsThumbs.forEach((doc: any) => {
            this.thumbnails.push(...doc);
          });

          let thumbIndex;
          if (this.activeThumbnail) {
            thumbIndex = this.thumbnails.indexOf(this.activeThumbnail);
            this.activeThumbnailIndex = thumbIndex;
            this.pageNumber = thumbIndex + 1;
            this.oldPageNumber = thumbIndex + 1;
            this.openedDocColor =
              this.thumbnails[this.pageNumber - 1].thumbColor;

            this.reorderDocumentEvent.emit({
              pageNumber: this.pageNumber,
              filesInfo,
            });
          }
        }
      })
    );
    this.subscriptions.add(
      this.triggerSeparateMethod.subscribe((triggerSeparate) => {
        if (triggerSeparate) {
          for (const [index, doc] of this.multipleDocsThumbs.entries()) {
            if (doc[0].fileId === this.fileId) {
              this.multipleDocsThumbs.splice(index, 1);
            }
          }
          this.thumbnails = [];
          this.multipleDocsThumbs.forEach((doc: any) => {
            this.thumbnails.push(...doc);
          });

          let thumbIndex;
          if (this.activeThumbnail.fileId === this.fileId) {
            thumbIndex = 0;
          } else {
            thumbIndex = this.thumbnails.indexOf(this.activeThumbnail);
          }
          this.pageNumber = thumbIndex + 1;
          this.oldPageNumber = thumbIndex + 1;

          this.activeThumbnailIndex = thumbIndex;
          this.openedDocColor = this.thumbnails[this.pageNumber - 1].thumbColor;
          this.separateDocumentEvent.emit({
            fileId: this.fileId,
            pageNumber: this.pageNumber,
          });
        }
      })
    );
  }

  @HostListener('document:click', ['$event'])
  // if we clicked outside od container, close it
  clickout($event: MouseEvent) {
    if (
      this.thumbContainer &&
      !this.thumbContainer.nativeElement.contains($event.target)
    ) {
      this.thumbnails.forEach((t) => (t.showDivider = false));
    }
  }

  ngOnInit(): void {
    // console.log(
    //   'reorder',
    //   this.multipleDocsThumbs,
    //   this.reorderFinished,
    //   this.reorderStates.length,
    //   this.thumbsStates.length
    // );
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

            this.setActiveThumb(this.thumbnails[res - 1]);
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
          multipleDocs?: boolean;
          pages: any;
          currentPage: number;
          originalImgExtension?: string;
          mainImgExtension?: string;
          colorValue?: string;
          docColorPallete: string[];
          reload?: boolean
        }) => {
          if (res && (res.currentPage || res.pages)) {
            this.pageNumber = res.currentPage;
            this.previousPageNum = res.currentPage;
            this.oldPageNumber = res.currentPage;
            this.docColorPallete = res.docColorPallete;
            this.reload = res.reload ?? false;

            if (res.originalImgExtension) {
              this.originalImgExtension = res.originalImgExtension;
            }
            if (res.mainImgExtension) {
              this.mainImgExtension = res.mainImgExtension;
            }

            this.docViewerService.pageNumberSubject.next(res.currentPage);
            if (res.pages && !res.multipleDocs) {
              this.multipleDocs = false;

              this.multipleDocsThumbs = [res.pages];
              this.thumbnails = [];
              this.multipleDocsThumbs.forEach((doc: any) => {
                this.thumbnails.push(...doc);
              });

              for (const [index, thumb] of this.thumbnails.entries()) {
                if (index + 1 === this.pageNumber) {
                  this.activeThumbnail = this.thumbnails[index];
                  this.setActiveThumb(this.thumbnails[index]);
                  this.activeThumbnailIndex = index;
                }
              }
            } else if (res.pages && res.multipleDocs) {
              this.multipleDocs = true;
              this.multipleDocsThumbs = res.pages;
              this.thumbnails = [];
              this.multipleDocsThumbs.forEach((doc: any) => {
                this.thumbnails.push(...doc);
              });

              for (const [index, thumb] of this.thumbnails.entries()) {
                if (index + 1 === this.pageNumber) {
                  this.activeThumbnail = this.thumbnails[index];
                  this.setActiveThumb(this.thumbnails[index]);
                  this.activeThumbnailIndex = index;
                }
              }
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

  mergeDocument(index?: number) { 
    if(index === undefined) {
      this.triggerMergeMethod.emit(this.mergeFilePairs);
    }else {
      let nestedMultiple;
      console.log(this.multipleDocsThumbs)
      if(index !== this.multipleDocsThumbs[this.multipleDocsThumbs?.length - 1]) {
        nestedMultiple = this.docViewerService.nestedCopy(
          this.multipleDocsThumbs
        );
        this.mergeFilePairs.push({ fileId1: this.multipleDocsThumbs[index][0].fileId, fileId2: this.multipleDocsThumbs[index + 1][0].fileId });
        this.multipleDocsThumbs[index] = [...this.multipleDocsThumbs[index], ...this.multipleDocsThumbs[index + 1]];
        this.multipleDocsThumbs.splice(index + 1, 1);
      }
      this.thumbsStates.push([...nestedMultiple]);
      this.mergeFilePairsState.push(this.mergeFilePairs)
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentsList'] && changes['documentsList'].currentValue) {
      this.documentsList = changes['documentsList'].currentValue;
    }
    if (changes['singleDocument'] && changes['singleDocument'].currentValue) {
      this.singleDocument = changes['singleDocument'].currentValue;
    }

    if (changes['reorderFinished'] && changes['reorderFinished'].currentValue) {
      this.reorderFinished = changes['reorderFinished'].currentValue;
    }
    if (
      changes['triggeredModalIsOpen'] &&
      changes['triggeredModalIsOpen'].currentValue
    ) {
      this.triggeredModalIsOpen = changes['triggeredModalIsOpen'].currentValue;
      if (
        this.triggeredModalIsOpen.triggered === true &&
        this.triggeredModalIsOpen.from === 'reorder'
      ) {
        this.triggerReorderMethod.next(true);
      }
      if (
        this.triggeredModalIsOpen.triggered === true &&
        this.triggeredModalIsOpen.from === 'separate'
      ) {
        this.triggerSeparateMethod.next(true);
      }
      console.log('data in lib', this.triggeredModalIsOpen);
    }
  }

  insertAt(array: any, index: number, newSplittedDoc: any) {
    array.splice(index, 0, newSplittedDoc);
  }

  onRightClick(event: any, image: Thumbnail, doc: Thumbnail[], imgId: string) {
    event.preventDefault();

    doc.forEach((img) => {
      img.showDivider = false;
    });

    image.showDivider = true;
  }

  showDividerAndSaveSplitting(
    event: Event,
    doc: Thumbnail[],
    image: Thumbnail,
    docIndex: number,
    imgIndex: number
  ) {
    let dividerExists = this.thumbnails.find((t) => t.showDivider);
    if (dividerExists) {
      dividerExists.showDivider = false;
    }

    //save for undo action
    let nestedMultiple = this.docViewerService.nestedCopy(
      this.multipleDocsThumbs
    );

    this.thumbsStates.push([...nestedMultiple]);

    const firstPart = doc.slice(0, imgIndex + 1);
    firstPart.forEach((fp) => (fp.thumbColor = this.docColorPallete[docIndex]));

    const secondPart = doc.slice(imgIndex + 1, doc.length);
    secondPart.forEach(
      (sp) =>
        (sp.thumbColor = this.docColorPallete[this.multipleDocsThumbs.length])
    );

    this.multipleDocsThumbs.splice(docIndex, 1);
    this.insertAt(this.multipleDocsThumbs, docIndex, firstPart);
    this.insertAt(this.multipleDocsThumbs, docIndex + 1, secondPart);

    image.showDivider = false;

    let mainDocColor = this.thumbnails[this.pageNumber - 1].thumbColor;
    if (mainDocColor) this.docViewerService.mainDocColor.next(mainDocColor);
    this.setActiveThumb(this.thumbnails[this.pageNumber - 1]);
  }

  showSettings(image: Thumbnail, fileId: string) {
    this.thumbnailInfo = image;
    image.showReorder = this.checkReorder(fileId);

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

  reorderPages(
    fileId: string,
    callService: boolean,
    pageNumber: number,
    icon: any
  ) {
    let mappedPages;
    if (this.multipleDocs) {
      mappedPages = this.openedDoc.file['newMappedPages'];
    } else {
      mappedPages = this.singleDocument.file['newMappedPages'];
    }
    console.log('mappedPages', mappedPages, this.multipleDocs);
    this.triggerPagesReorder.emit({
      fileId,
      mappedPages,
      callService,
      pageNumber,
      icon,
    });
  }

  undoMerge() {
    this.multipleDocsThumbs = this.thumbsStates[this.thumbsStates.length - 1];
    this.thumbnails = [];
    this.thumbsStates.pop();

    this.multipleDocsThumbs.forEach((doc: any) => {
      this.thumbnails.push(...doc);
    });

    this.mergeFilePairs = [];
    this.mergeFilePairsState.pop();
    if(this.mergeFilePairsState?.length) {
      this.mergeFilePairsState.forEach((pair: any) => {
        this.mergeFilePairs.push(pair);
      });
    }
    this.triggerMergeMethod.emit(this.mergeFilePairs);
  }

  undoSplit() {
    this.thumbnails = [];
    this.multipleDocsThumbs.forEach((doc: any) => {
      this.thumbnails.push(...doc);
    });
    this.thumbsStates.pop();

    // update main doc color
    let mainDocColor = this.thumbnails[this.pageNumber - 1].thumbColor;
    this.docViewerService.mainDocColor.next(mainDocColor);
    this.setActiveThumb(this.thumbnails[this.pageNumber - 1]);
  }

  undoReorder() {
    this.multipleDocsThumbs = this.reorderStates[this.reorderStates.length - 1];
    this.thumbnails = this.multipleDocsThumbs[0];
    this.reorderStates.pop();
  }

  splitDocument(fileId: string, icon: HTMLElement) {
    const pagesArr = [];
    let counter = 0;

    for (const doc of this.multipleDocsThumbs) {
      let range = [];
      for (let i = 1 + counter; i <= doc.length + counter; i++) {
        range.push(i);
      }
      pagesArr.push(range);
      counter += doc.length;
    }

    console.log({ pagesArr });

    this.triggerSplitDocument.emit({ fileId, icon, pagesArr });
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
          JSON.stringify(singleDoc.file.mappedPages) ==
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
        (singleDoc.file.mappedPages === undefined ||
          singleDoc.file.mappedPages.length === 0)
      ) {
        // console.log(
        //   'reorder',
        //   singleDoc,
        //   singleDoc.file.mappedPages,
        //   singleDoc.file['newMappedPages']
        // );
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

  drop(event: any, innerImgArray: any[], docIndex: number) {
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    //check order of thumbs
    let counter = 0;
    for (let i = 0; i < innerImgArray.length; i++) {
      if (innerImgArray[i] === this.thumbnails[i]) {
        counter++;
      }
    }
    if (counter === innerImgArray.length) return;

    //for undo action
    this.reorderStates.push([[...innerImgArray]]);
    moveItemInArray(innerImgArray, event.previousIndex, event.currentIndex);
    this.thumbnails = innerImgArray;

    if (this.activeThumbnail.fileId === innerImgArray[0].fileId) {
      const pageNumNew = this.getPageNum(docIndex) + event.currentIndex + 1;
      this.pageNumber = pageNumNew;
      this.oldPageNumber = pageNumNew;
    }

    this.openedDoc = this.documentsList.find(
      (doc: any) => doc.file._id === innerImgArray[0].fileId
    );
    this.openedDoc.file['newMappedPages'] = innerImgArray.map((item) =>
      Number(item.id)
    );

    this.multipleDocsThumbs[docIndex][0].showReorder = this.checkReorder(
      innerImgArray[0].fileId
    );
    this.thumbnailInfo.showReorder = this.checkReorder(innerImgArray[0].fileId);
    // console.log('reorder', this.thumbnailInfo.showReorder);
    //reorder pages, but without service calling
    this.reorderPages(innerImgArray[0].fileId, false, this.pageNumber, null);
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
    let offsetTop;
    let parentOffsetTop;
    offsetTop = document.getElementById('img-' + pageNumber)?.offsetTop;
    parentOffsetTop = document.getElementById('img-' + pageNumber)
      ?.parentElement?.offsetTop;

    if (parentOffsetTop && offsetTop) {
      this.thumbnailContainer?.nativeElement.scrollTo({
        top: parentOffsetTop + offsetTop,
        behavior: 'auto',
      });
    } else if (offsetTop) {
      this.thumbnailContainer?.nativeElement.scrollTo({
        top: offsetTop,
        behavior: 'auto',
      });
    }
    if (this.inputRange) {
      this.inputRange.nativeElement.value = this.pageNumber;
    }
    this.calculateThumbPosition();
    const mainImg = this.thumbnails[this.pageNumber - 1].src.replace(
      'thumb',
      'img'
    );

    if (this.documentsList.length)
      this.openedDoc = this.documentsList.find(
        (doc: any) =>
          doc.file._id === this.thumbnails[this.pageNumber - 1].fileId
      );

    console.log('opened', this.openedDoc, mainImg, this.documentsList);
    this.docViewerService.mainImgInfo.next({
      mainImg,
      originalImgExtension: this.documentsList.length
        ? this.openedDoc['originalImg']
        : this.originalImgExtension,
      mainImgExtension: this.documentsList.length
        ? this.openedDoc['mainImgExtension']
        : this.mainImgExtension,
      colorValue: this.thumbnails[this.pageNumber - 1].thumbColor,
      reload: this.reload
    });
    this.openedDocColor = this.thumbnails[this.pageNumber - 1].thumbColor;
    this.setActiveThumb(this.thumbnails[this.pageNumber - 1]);
    this.triggerTextLayer.emit({
      pageNumber: this.pageNumber,
      pageChange: isChangePage,
      fileId: this.thumbnails[this.pageNumber - 1].fileId,
      thumbId: +this.thumbnails[this.pageNumber - 1].id,
    });
  }
  separateDocument(fileId?: string, e?: MouseEvent) {
    this.top = e?.pageY;
    this.fileId = fileId;
    this.openTriggeredEmittert.emit({
      open: true,
      top: this.top,
      from: 'separate',
    });
  }

  arrowPageChange(addNum: number) {
    this.pageNumber = this.pageNumber + addNum;

    this.changePage(
      this.pageNumber,
      true,
      this.thumbnails[this.pageNumber - 1]
    );
  }

  //fires on thumbnail click
  changePage(
    pageNumber: number,
    changeActivation: boolean,
    thumbnail: Thumbnail
  ) {
    this.changeActivated = changeActivation;
    this.pageNumber = pageNumber;
    this.activeThumbnail = thumbnail;

    this.setActiveThumb(thumbnail);
    if (this.pageNumber !== this.oldPageNumber) {
      this.clearTextLayer();

      this.docViewerService.pageNumberSubject.next(pageNumber);
      this.isChangePage = true;
      this.docViewerService.pageChange.next(true);
      this.scrollToPageNumber(2, this.pageNumber, true);
    }
    this.oldPageNumber = pageNumber;
    this.changeActivated = false;
    if (thumbnail.hasSearchedText) {
      this.docViewerService.activateSearch.next(pageNumber);
    } else {
      this.docViewerService.activateSearch.next(0);
    }
  }

  setActiveThumb(thumbnail: Thumbnail) {
    let thumbs = this.thumbnails.filter((t) => t !== thumbnail);
    if (thumbs.length !== 0) {
      thumbs.forEach((th) => (th.activeThumbnail = false));
    }

    thumbnail.activeThumbnail = true;
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
    setTimeout(() => {
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
    }, 0);
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

  reorderDocument(
    thumb: Thumbnail,
    offsetNum: number,
    docIndex: number,
    e: MouseEvent
  ) {
    this.thumb = thumb;
    this.offsetNum = offsetNum;
    this.docIndex = docIndex;
    this.top = e.pageY;

    this.openTriggeredEmittert.emit({
      open: true,
      top: this.top,
      from: offsetNum === -1 ? 'up' : 'down',
    });
  }

  ngOnDestroy(): void {
    this.results$.unsubscribe();
    this.destroy$.next(null);
    this.destroy$.complete();

    this.showThumbSettings = false;
  }
}
