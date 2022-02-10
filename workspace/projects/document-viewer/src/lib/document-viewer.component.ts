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
  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  @Output('linePosition') linePosition = new EventEmitter();
  @Input('searchResult') searchResult: SearchResult[] = [];
  @Input('currentPage') initialPage = 1;
  @Input('token') token?: string = '';
  @Input('pageInfo') pageInfo: any;
  @Input('thumbnails') thumbnails: Thumbnail[] = [{ id: '', src: '' }];
  @Input('totalPages') totalPages: number = 0;
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    zoomInSrc: '',
    zoomOutSrc: '',
    fitToPageSrc: '',
    informationHelp: '',
    downloadPdfPlain: '',
  };
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  @Input('docModel') docModel: any;
  @Input('params') params: any;
  @Input('singleDocument') singleDocument: any;
  @Input('inProjects') inProjects: any;
  @Output('naturalDimensions') naturalDimensions = new EventEmitter();
  subscriptions = new Subscription();
  destroy$ = new Subject();
  collapsStatus = false;
  ngOnInit() {
    this.subscriptions = this.docViewerService.lineStatus.subscribe(
      (status) => {
        this.linePosition.emit();
      }
    );
  }

  constructor(private docViewerService: DocumentViewerService) {}

  ngAfterViewInit() {}

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

  downloadDocument(event: Event) {
    this.downloadDocumentEvent.emit(event);
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

  getFileTypeForHipotekarnaSub(data: any) {
    if (
      (this.docModel.modelContainerId === '60e448112eaba436d16da8d9' ||
        this.docModel.modelContainerId === '61091c067e9ae6f8779d131c' ||
        this.docModel.modelContainerId === '61dbe46ea61675eb2f95c632' ||
        this.docModel.modelContainerId === '61dc181da61675eb2f98401b') &&
      data.length !== 0 &&
      data[0].groupsList[0].intents.length !== 0 &&
      data[0].groupsList[0].intents[0].intentsList.length !== 0 &&
      data[0].groupsList[0].intents[0].intentsList[0].entities.length !== 0 &&
      data[0].groupsList[0].intents[0].intentsList[0].entities[0].entitiesList
        .length !== 0
    ) {
      const entValue =
        data[0].groupsList[0].intents[0].intentsList[0].entities[0]
          .entitiesList[0].value;
      if (entValue !== '') {
        return entValue;
      } else {
        return 'N/A';
      }
    } else {
      return 'N/A';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageInfo'] && changes['pageInfo'].currentValue) {
      this.docViewerService.pageInfo.next(changes['pageInfo'].currentValue);
    }
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
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
    }
    if (changes['docModel']) {
      this.docModel = changes['docModel'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }

  changeDoc(status: boolean) {
    this.docViewerService.changeDocSubject.next(true);
    this.changeDocument.emit(status);
  }
}
