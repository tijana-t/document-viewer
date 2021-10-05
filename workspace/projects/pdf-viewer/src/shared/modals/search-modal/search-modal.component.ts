import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SearchResult } from 'projects/pdf-viewer/src/lib/_config/document-search.model';
import { SearchConfig } from 'projects/pdf-viewer/src/lib/_config/search.model';
import { Subscription } from 'rxjs';
import { PdfViewerService } from '../../../lib/pdf-viewer.service';

@Component({
  selector: 'lib-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {
  @Output('searchTextInDoc') searchTextInDoc = new EventEmitter();
  @Output('searchObject') searchObject = new EventEmitter();
  searchDocument = '';
  subscriptions = new Subscription();
  searchResult: SearchResult[] = [];
  config: SearchConfig = {
    containerWidth: 180,
  };
  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.pdfViewerService.searchResultSubject.subscribe(
        (res: SearchResult[]) => {
          this.searchResult = res;
        }
      )
    );
  }
  sendSearchObj(searchObj: SearchResult) {
    if (searchObj) {
      this.searchObject.next(searchObj);
    }
  }
  searchTextInDocument(event: string) {
    if (event === '') {
      this.searchResult = [];
    } else {
      console.log('emit from search', event);
      this.searchTextInDoc.emit(event);
    }
  }
}
