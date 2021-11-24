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

@Component({
  selector: 'ngx-view-document',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
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
    containerHeight: 0,
    containerWidth: 0,
  };
  @Input('docModel') docModel: string = '';
  @Input('params') params: any;
  @Input('singleDocument') singleDocument: any;
  @Input('inProjects') inProjects: any;
  subscriptions = new Subscription();
  destroy$ = new Subject();
  ngOnInit() {
    this.subscriptions = this.docViewerService.lineStatus.subscribe(
      (status) => {
        if (status) {
          this.linePosition.emit();
        }
      }
    );
  }

  constructor(private docViewerService: DocumentViewerService) {}

  ngAfterViewInit() {}

  emitSearchedText(event: any) {
    this.searchDocument.emit(event);
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageInfo'] && changes['pageInfo'].currentValue) {
      this.docViewerService.pageInfo.next(changes['pageInfo'].currentValue);
    }
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }

  changeDoc(status: boolean) {
    this.docViewerService.changeDocSubject.next(true);
    this.changeDocument.emit(status);
  }
}
