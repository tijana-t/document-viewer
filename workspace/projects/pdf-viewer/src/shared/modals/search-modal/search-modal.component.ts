import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
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
export class SearchModalComponent implements OnInit, OnDestroy {
  @Output('searchTextInDoc') searchTextInDoc = new EventEmitter();
  @Output('pageSearch') pageSearch = new EventEmitter();
  searchDocument = '';
  subscriptions = new Subscription();
  config: SearchConfig = {
    containerWidth: 180,
  };
  searchSubject = new Subject();
  groupedByPage: any;
  searchLoader = false;
  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.pdfViewerService.searchResultSubject.subscribe(
        (res: SearchResult[]) => {
          this.groupedByPage = res;
          this.pdfViewerService.groupedByPageSubj.next(this.groupedByPage);

          if (this.groupedByPage) {
            const importantPages: number[] = this.groupedByPage.map(
              (arr: any) => arr[0].pageNums[0]
            );
            this.pdfViewerService.importantPages.next(importantPages);
          }
          this.searchLoader = false;
        }
      )
    );

    //wait small amount of time before another request is called
    this.subscriptions.add(
      this.searchSubject
        .pipe(debounceTime(800), distinctUntilChanged())
        .subscribe((res: any) => {
          this.searchTextInDoc.emit(res);
        })
    );

    this.subscriptions.add(
      this.pdfViewerService.activateSearch.subscribe((pageNumber) => {
        if (this.groupedByPage && pageNumber !== 0) {
          const searchArr = [];
          for (const pageResult of this.groupedByPage) {
            for (const singleObj of pageResult) {
              if (singleObj.pageNums.includes(pageNumber)) {
                searchArr.push(singleObj);
              }
            }
          }
          this.pageSearch.next({
            pageSearch: searchArr,
            pageNumber: pageNumber,
          });
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
  groupByPageNumber(array: SearchResult[]): { [key: number]: SearchResult[] } {
    return array.reduce((r, a) => {
      r[a.pageNums[0]] = r[a.pageNums[0]] || [];
      r[a.pageNums[0]].push(a);
      return r;
    }, Object.apply(null));
  }

  cleanSearch() {
    // if we delete input, remove highlighted elements
    this.searchDocument = '';
    const highlightedElements = document.querySelectorAll(
      `[class*="search-intent"]`
    );
    if (highlightedElements) {
      highlightedElements.forEach((el) => el.remove());
    }
    this.groupedByPage = [];
    this.pdfViewerService.groupedByPageSubj.next(null);
    this.pdfViewerService.importantPages.next([]);
    this.searchTextInDoc.emit(null);
  }

  searchTextInDocument(event: string) {
    if (event === '' && event.length < 3) {
      this.cleanSearch();
    } else {
      this.searchLoader = true;
      this.searchSubject.next(event);
      this.pdfViewerService.searchValue.next(event);
    }
  }

  ngOnDestroy() {
    this.cleanSearch();
    this.subscriptions.unsubscribe();
  }
}
