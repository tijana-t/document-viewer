import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DocumentViewerService } from './document-viewer.service';
import { DocumentActions } from './_config/document-actions.model';
import { SearchResult } from './_config/document-search.model';
import { DocumentConfig } from './_config/document.model';
import { Thumbnail } from './_config/thumbnail.model';
import { skip, takeUntil } from 'rxjs/operators';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'ngx-view-document',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ width: 25, opacity: 0 }),
        animate('0.3s ease-out', style({ width: 'auto', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ width: 'auto', opacity: 1 }),
        animate('0.3s ease-in', style({ width: 25, opacity: 0 })),
      ]),
    ]),
  ],
})
export class DocumentViewerComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Output('searchDocument') searchDocument = new EventEmitter();
  @Output('changeDocument') changeDocument = new EventEmitter();
  @Output('pageSearch') pageSearch = new EventEmitter();
  @Output('downloadDocumentEvent') downloadDocumentEvent = new EventEmitter();
  @Output('isOpen') isOpen = new EventEmitter();
  @Output('downloadExcelEvent') downloadExcelEvent = new EventEmitter();
  @Output('sendDocConfigEvent') sendDocConfigEvent = new EventEmitter();
  @Output('switchSelectionEmit') switchSelectionEmit = new EventEmitter();
  @Output('downloadParagraphsEvent') downloadParagraphsEvent =
    new EventEmitter();

  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  @Output('separateDocumentEvent') separateDocumentEvent = new EventEmitter();
  @Output('reorderDocumentEvent') reorderDocumentEvent = new EventEmitter();
  @Output('openTriggeredEvent') openTriggeredEvent = new EventEmitter();
  @Output('linePosition') linePosition = new EventEmitter();
  @Output('filterPatternEvent') filterPatternEvent = new EventEmitter();
  @Output('triggerPagesReorder') pagesReorderEvent = new EventEmitter();
  @Output('triggerSplitDocument') triggerSplitEvent = new EventEmitter();
  @Output('exportMonthlyStat') exportMonthlyStat = new EventEmitter();
  @Input('searchResult')
  searchResult: SearchResult[] = [];
  @Input('currentPage') initialPage = 1;
  @Input('token') token?: string = '';
  @Input('pageInfo') pageInfo: any;
  @Input('thumbnails') thumbnails: Thumbnail[] = [
    { id: '', src: '', fileId: '', fileName: '', originalName: '' },
  ];
  @Input('totalPages') totalPages: number = 0;
  @Input('qAndAModel') qAndAModel = false;
  @Input('reorderFinished') reorderFinished: boolean = false;
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    zoomInSrc: '',
    zoomOutSrc: '',
    fitToPageSrc: '',
    informationHelp: '',
    downloadPdfPlain: '',
    downloadExcel: '',
  };
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  @Input('docModel') docModel: any;
  @Input('activeFileId') activeFileId: string = '';
  @Input('isOpenVar') isOpenVar: boolean = false;
  @Input('params') params: any;
  @Input('singleDocument') singleDocument: any;
  @Input('inProjects') inProjects: any;
  @Output('naturalDimensions') naturalDimensions = new EventEmitter();
  @Output('showDebugger') showDebugger = new EventEmitter();
  @Output('triggerRoute') triggerRoute = new EventEmitter();
  @Input('triggeredModalIsOpen') triggeredModalIsOpen: any;
  subscriptions = new Subscription();
  destroy$ = new Subject();
  collapsStatus = false;
  multipleDocs: boolean = false;
  filterFileIds = [];
  openedDocColor: string = '';
  selectedFile: any;
  isFlagGreen: boolean | null = null;
  ngOnInit() {
    this.subscriptions = this.docViewerService.lineStatus.subscribe(
      (status) => {
        this.linePosition.emit();
      }
    );

    this.subscriptions = this.docViewerService.showDebugger.subscribe((res) =>
      this.showDebugger.next(res)
    );

    this.subscriptions = this.docViewerService.mainImgInfo
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(
        (res: {
          mainImg: string;
          originalImgExtension?: string;
          mainImgExtension?: string;
          colorValue?: string;
        }) => {
          if (res && res.colorValue) {
            this.openedDocColor = res.colorValue;
          }
        }
      );
  }

  constructor(private docViewerService: DocumentViewerService) {}

  ngAfterViewInit() {}
  redirectTo(fileId: string) {
    this.triggerRoute.next(fileId);
  }
  emitSearchedText(event: any) {
    this.searchDocument.emit(event);
  }

  emitImgNaturalDimension($event: any) {
    this.naturalDimensions.emit($event);
  }

  emitPageSearch(result: { pageSearch: SearchResult[]; pageNumber: number }) {
    this.pageSearch.next({
      pageSearch: result.pageSearch,
      pageNumber: result.pageNumber,
    });
  }

  triggerTextLayerCreation(event: Event) {
    this.triggerTextLayer.emit(event);
  }

  triggerSeparateDocument(event: Event) {
    this.separateDocumentEvent.next(event);
  }

  openTriggered(event: Event) {
    console.log('event', event);
    this.openTriggeredEvent.next(event);
  }

  triggerReorderDocument(event: Event) {
    this.reorderDocumentEvent.next(event);
  }

  downloadDocument(event: Event) {
    this.downloadDocumentEvent.emit(event);
  }

  downloadExcel(event: Event) {
    this.downloadExcelEvent.emit(event);
  }

  downloadParagraphs(event: Event) {
    this.downloadParagraphsEvent.emit(event);
  }

  removeExtension(fileName: string) {
    var lastDotPosition = fileName.lastIndexOf('.');
    if (lastDotPosition === -1) return fileName;
    else return fileName.substr(0, lastDotPosition);
  }

  collapsSubDocs() {
    if (!this.collapsStatus) {
      for (let i = 0; i < this.singleDocument.file.matchingDocs.length; i++) {
        setTimeout(() => {
          this.singleDocument.file.matchingDocs[i].collaps = true;
        }, 100 * (i + 1));
      }
    } else {
      for (
        let i = this.singleDocument.file.matchingDocs.length - 1;
        i > -1;
        i--
      ) {
        setTimeout(() => {
          this.singleDocument.file.matchingDocs[i].collaps = false;
        }, Math.abs(100 * (i - this.singleDocument.file.matchingDocs.length + 1)));
      }
    }
    this.collapsStatus = !this.collapsStatus;
  }

  triggerPagesReorder($event: any) {
    this.pagesReorderEvent.emit($event);
  }

  triggerSplitDocument($event: any) {
    this.triggerSplitEvent.emit($event);
  }
  checkSelectedDocs() {
    if (this.singleDocument.originalMergedDocs) {
      let check = this.singleDocument.originalMergedDocs.filter(
        (el: any) => el.file.filterValue === true
      ).length;
      if (check == 0 || check > 1) {
        this.selectedFile = undefined;
      }
      return check > 1;
    } else {
      return false;
    }
  }
  filterPattern(checked: boolean, file: any) {
    let fileId;
    let filterValue;
    this.activeFileId = '';

    file.file['filterValue'] = checked;
    fileId = file.file._id;
    filterValue = checked;
    let findChecked = this.singleDocument.originalMergedDocs.find(
      (el: any) => el.file.filterValue === true
    );
    if (findChecked !== -1) {
      this.selectedFile = findChecked;
      // fileId = this.selectedFile.file._id;
    }

    this.filterPatternEvent.emit({ fileId, filterValue });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageInfo'] && changes['pageInfo'].currentValue) {
      this.docViewerService.pageInfo.next(changes['pageInfo'].currentValue);
    }
    if (changes['isOpenVar'] && changes['isOpenVar'].currentValue) {
      this.isOpen.emit(changes['isOpenVar'].currentValue);
    }
    if (changes['activeFileId'] && changes['activeFileId'].currentValue) {
      const f = this.singleDocument.originalMergedDocs.find(
        (doc: any) => doc.file._id === changes['activeFileId'].currentValue
      );
      f.file.filterValue = true;
      console.log({ f });
      this.selectedFile = f;
    }

    if (changes['reorderFinished'] && changes['reorderFinished'].currentValue) {
      this.reorderFinished = changes['reorderFinished'].currentValue;
    }
    if (
      changes['triggeredModalIsOpen'] &&
      changes['triggeredModalIsOpen'].currentValue
    ) {
      this.triggeredModalIsOpen = changes['triggeredModalIsOpen'].currentValue;
    }
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
      if (this.documentConfig.flag === 'red') {
        this.isFlagGreen = false;
      } else if (this.documentConfig.flag === 'green') {
        this.isFlagGreen = true;
      }
      this.docViewerService.docConfSubject.next(this.documentConfig);
    }
    if (changes['searchResult'] && changes['searchResult'].currentValue) {
      this.docViewerService.searchResultSubject.next(
        changes['searchResult'].currentValue
      );
    }
    if (changes['totalPages'] && changes['totalPages'].currentValue) {
      this.totalPages = changes['totalPages'].currentValue;
    }
    if (changes['singleDocument'] && changes['singleDocument'].currentValue) {
      this.singleDocument = changes['singleDocument'].currentValue;
      if (this.documentConfig.flag === '' && this.singleDocument?.toFix) {
        if (this.singleDocument?.toFix?.length === 0) {
          this.isFlagGreen = true;
        } else {
          this.isFlagGreen = false;
        }
      }
      // console.log('singleDocument', this.singleDocument);
      if (this.singleDocument.mergedDocs) {
        this.collapsStatus = false;
        this.multipleDocs = true;
      } else {
        let disableFirst =
          this.singleDocument?.file?.fileName ===
          this.singleDocument?.prev?.fileName;
        let disableLast =
          this.singleDocument?.file?.fileName ===
          this.singleDocument?.next?.fileName;
        setTimeout(() => {
          let prevDoc = document.querySelector('#docPrev');
          let nextDoc = document.querySelector('#docNext');

          // console.log({ disableFirst, disableLast, prevDoc, nextDoc });

          if (prevDoc !== null) {
            if (disableFirst) {
              prevDoc.classList.add('disable-next-prev');
            } else {
              prevDoc.classList.remove('disable-next-prev');
            }
          }
          if (nextDoc !== null) {
            if (disableLast) {
              nextDoc.classList.add('disable-next-prev');
            } else {
              nextDoc.classList.remove('disable-next-prev');
            }
          }
        }, 10);

        this.multipleDocs = false;

        this.getFileTypeForHipotekarna(
          this.singleDocument.file,
          this.singleDocument.data
        );
      }
      this.collapsStatus = false;
    }
    if (changes['docModel'] && changes['docModel'].currentValue) {
      this.docModel = changes['docModel'].currentValue;
    }
  }

  getFileTypeForHipotekarna(file: any, data: any) {
    if (
      file.isModelContainerRjesenje &&
      data &&
      data.length !== 0 &&
      data[0].groupsList[0].intents.length !== 0 &&
      data[0].groupsList[0].intents[0].intentsList.length !== 0 &&
      data[0].groupsList[0].intents[0].intentsList[0].entities.length !== 0 &&
      data[0].groupsList[0].intents[0].intentsList[0].entities[0].entitiesList
        .length !== 0 &&
      (data[0].groupsList[0].intents[0].intentsList[0].entities[0].entityId ===
        '61693fb93185442be424dce0' ||
        data[0].groupsList[0].intents[0].intentsList[0].entities[0].entityId ===
          '616942f7c5a9882da0a4446b')
    ) {
      const entValue =
        data[0].groupsList[0].intents[0].intentsList[0].entities[0]
          .entitiesList[0].value;
      if (entValue !== '') {
        file.type = entValue;
      } else {
        file.type = 'N/A';
      }
    }
    //check type for matchingDocs
    if (file && file.matchingDocs && file.matchingDocs.length !== 0) {
      for (const matchDoc of file.matchingDocs) {
        // this.getFileTypeForHipotekarna(matchDoc, matchDoc.data);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }

  openMatchingDoc(matchingDoc: any) {
    this.docViewerService.changeDocSubject.next(true);
    this.changeDocument.emit({ matchingDoc });
  }
  changeDoc(status: boolean) {
    this.docViewerService.changeDocSubject.next(true);
    this.changeDocument.emit({ status, matchingDoc: null });
  }
  isOpenEmmit(isOpen: boolean) {
    this.isOpen.emit(isOpen);
  }

  switchSelection(event: any) {
    this.switchSelectionEmit.emit(true);
  }

  sendDocConfig(docConfig: any) {
    console.log({ docConfig });
    this.sendDocConfigEvent.emit(docConfig);
  }

  exportMonthlyStatEventEmmiter(data: any) {
    this.exportMonthlyStat.emit(data);
  }
  onClickArchived(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }
}
