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
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PdfViewerService } from './pdf-viewer.service';
import { DocumentActions } from './_config/document-actions.model';
import { SearchResult } from './_config/document-search.model';
import { DocumentConfig } from './_config/document.model';
import { Thumbnail } from './_config/thumbnail.model';

@Component({
  selector: 'lib-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit, AfterViewInit, OnChanges {
  @Output('searchDocument') searchDocument = new EventEmitter();
  @Output('pageSearch') pageSearch = new EventEmitter();
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
  private url: string = '';
  subscriptions = new Subscription();
  destroy$ = new Subject();
  ngOnInit() {
    this.url = this.router.url;

    this.subscriptions = this.pdfViewerService.lineStatus.subscribe(
      (status) => {
        if (status) {
          this.linePosition.emit();
        }
      }
    );
  }

  constructor(
    private pdfViewerService: PdfViewerService,
    private router: Router
  ) {}

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageInfo'] && changes['pageInfo'].currentValue) {
      this.pdfViewerService.pageInfo.next(changes['pageInfo'].currentValue);
    }
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
    if (changes['searchResult'] && changes['searchResult'].currentValue) {
      this.pdfViewerService.searchResultSubject.next(
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

  changeDoc(status: boolean) {
    this.clearTextLayer();
    if (!this.inProjects) {
      if (status) {
        this.router.navigateByUrl(
          `/training/models/${this.url.split('/')[3]}/${this.params.modelId}/${
            this.url.split('/')[5]
          }/${this.singleDocument.next.id}/${
            this.singleDocument.next.fileName
          }/1/`
        );
      } else {
        this.router.navigateByUrl(
          `/training/models/${this.url.split('/')[3]}/${this.params.modelId}/${
            this.url.split('/')[5]
          }/${this.singleDocument.prev.id}/${
            this.singleDocument.prev.fileName
          }/1/`
        );
      }
    } else {
      if (status) {
        this.router.navigateByUrl(
          `/projects/viewer/${this.url.split('/')[3]}/${
            this.url.split('/')[4]
          }/${this.singleDocument.next.id}/${
            this.singleDocument.next.fileName
          }/1/`
        );
      } else {
        this.router.navigateByUrl(
          `/projects/viewer/${this.url.split('/')[3]}/${
            this.url.split('/')[4]
          }/${this.singleDocument.prev.id}/${
            this.singleDocument.prev.fileName
          }/1/`
        );
      }
    }
  }
}
