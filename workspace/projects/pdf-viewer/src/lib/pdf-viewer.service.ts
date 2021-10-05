import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DocumentConfig } from '../public-api';
import { SearchResult } from './_config/document-search.model';

@Injectable({
  providedIn: 'root',
})
export class PdfViewerService {
  pageNumberSubject = new BehaviorSubject<number>(1);
  token = new BehaviorSubject<string>('');
  modalStatus = new BehaviorSubject<boolean>(false);
  searchResultSubject = new BehaviorSubject<SearchResult[]>([]);
  docConfSubject = new BehaviorSubject<DocumentConfig>({
    containerWidth: 0,
    containerHeight: 0,
  });
  pageInfo = new BehaviorSubject<any>({});

  constructor() {}
}
