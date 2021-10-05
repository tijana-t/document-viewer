import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
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
  constructor(private pdfViewerService: PdfViewerService) {}

  @Input('searchResult') searchResult: SearchResult[] = [];
  @Output('searchDocument') searchDocument = new EventEmitter();
  @Output('acceptSearchObj') acceptSearchObj = new EventEmitter();
  @Output('documentConfig') docConfig = new EventEmitter();
  @Output('triggerTextLayer') triggerTextLayer = new EventEmitter();
  @Input('documentImg') documentImg: string = '';
  @Input('currentPage') initialPage = 1;
  // @Input('changedPage') changedPage = 1;
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
  @Input('docName') docName: string = '';
  @Input('docDate') docDate: string = '';
  @Input('docModel') docModel: string = '';
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerHeight: 0,
    containerWidth: 0,
  };

  subscriptions = new Subscription();
  destroy$ = new Subject();
  ngOnInit() {
    this.subscriptions.add(
      this.pdfViewerService.docConfSubject
        .pipe(skip(1), takeUntil(this.destroy$))
        .subscribe((res: DocumentConfig) => {
          if (res) {
            this.documentConfig = res;
            this.docConfig.emit(this.documentConfig);
          }
        })
    );
  }

  ngAfterViewInit() {}

  emitSearchedText(event: any) {
    this.searchDocument.emit(event);
  }
  emitSearchedObj(searchObj: SearchResult) {
    this.acceptSearchObj.next(searchObj);
  }

  triggerTextLayerCreation(event: Event) {
    this.triggerTextLayer.emit(event);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageInfo'] && changes['pageInfo'].currentValue) {
      this.pageInfo = changes['pageInfo'].currentValue;
      this.pdfViewerService.pageInfo.next(this.pageInfo);
      console.log('info');
      //note: needs update
      this.thumbnails = [...this.pageInfo.pages];

      this.pdfViewerService.pageNumberSubject.next(this.pageInfo.currentPage);
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
