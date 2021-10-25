import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SearchResult } from 'projects/pdf-viewer/src/lib/_config/document-search.model';
import { SearchConfig } from 'projects/pdf-viewer/src/lib/_config/search.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PdfViewerService } from '../../../lib/pdf-viewer.service';

@Component({
  selector: 'lib-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {
  @Output('searchTextInDoc') searchTextInDoc = new EventEmitter();
  @Output('pageSearch') pageSearch = new EventEmitter();
  searchDocument = '';
  subscriptions = new Subscription();
  config: SearchConfig = {
    containerWidth: 180,
  };
  searchSubject = new Subject();
  groupedByPage: any;
  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.pdfViewerService.searchResultSubject.subscribe(
        (res: SearchResult[]) => {
          this.groupedByPage = [];
          const groupedSearchResult = this.groupByPageNumber(res);
          for (let obj in groupedSearchResult) {
            if (obj) {
              this.groupedByPage.push(groupedSearchResult[obj]);
            }
          }
          this.pdfViewerService.groupedByPageSubj.next(this.groupedByPage);

          if (this.groupedByPage) {
            const importantPages: number[] = this.groupedByPage.map(
              (arr: any) => arr[0].pageNums[0]
            );
            this.pdfViewerService.importantPages.next(importantPages);
          }
        }
      )
    );
    5;

    //wait small amount of time before another request is called
    this.subscriptions.add(
      this.searchSubject
        .pipe(debounceTime(800), distinctUntilChanged())
        .subscribe((res: any) => {
          if (res) {
            this.searchTextInDoc.emit(res);
          } else {
            this.pdfViewerService.importantPages.next([]);
          }
        })
    );

    this.subscriptions.add(
      this.pdfViewerService.activateSearch.subscribe((pageNumber) => {
        if (this.groupedByPage && pageNumber !== 0) {
          for (const pageResult of this.groupedByPage) {
            if (pageResult[0].pageNums[0] === pageNumber) {
              this.pageSearch.next(pageResult);
            }
          }
          // if we don't have searchedText on selected page, remove selection if already existed
        } else if (pageNumber === 0) {
          const highlightedElements = document.querySelectorAll(
            `[class*="search-intent"]`
          );
          if (highlightedElements) {
            highlightedElements.forEach((el) => el.remove());
          }
        }
      })
    );
  }
  sendSearchObj(pageSearch: SearchResult) {
    console.log({ pageSearch });
    this.pageSearch.next([pageSearch]);
  }

  groupByPageNumber(array: SearchResult[]): { [key: number]: SearchResult[] } {
    return array.reduce((r, a) => {
      r[a.pageNums[0]] = r[a.pageNums[0]] || [];
      r[a.pageNums[0]].push(a);
      return r;
    }, Object.apply(null));
  }
  searchTextInDocument(event: string) {
    if (event === '') {
      // if we delete input, remove highlighted elements
      const highlightedElements = document.querySelectorAll(
        `[class*="search-intent"]`
      );
      if (highlightedElements) {
        highlightedElements.forEach((el) => el.remove());
      }
      this.groupedByPage = [];
      this.pdfViewerService.groupedByPageSubj.next(null);

      this.searchSubject.next(null);
    } else {
      this.searchSubject.next(event);
    }
  }
}
