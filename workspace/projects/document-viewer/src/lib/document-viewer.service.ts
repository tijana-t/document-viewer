import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DocumentConfig, ShowDocumentConfig } from '../public-api';
import { SearchResult } from './_config/document-search.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentViewerService {
  pageNumberSubject = new BehaviorSubject<number>(0);
  token = new BehaviorSubject<string>('');
  modalStatus = new BehaviorSubject<boolean>(false);
  lineStatus = new BehaviorSubject<boolean>(false);
  fitToPage = new BehaviorSubject<boolean>(false);
  searchResultSubject = new BehaviorSubject<SearchResult[]>([]);
  zoomInStarted = new BehaviorSubject<boolean>(false);
  zoomXStatus = new BehaviorSubject<boolean>(false);
  changeDocSubject = new BehaviorSubject<boolean>(false);
  docConfSubject = new BehaviorSubject<DocumentConfig>({ containerWidth: 0 });
  pageInfo = new BehaviorSubject<any>({});
  mainImgInfo = new BehaviorSubject<{
    mainImg: string;
    originalImgExtension?: string;
    mainImgExtension?: string;
  }>({ mainImg: '' });
  importantPages = new BehaviorSubject<number[]>([0]);
  activateSearch = new BehaviorSubject<number>(0);
  groupedByPageSubj = new BehaviorSubject<any>(null);
  searchValue = new BehaviorSubject<string>('');
  triggerSyncOrginal = new BehaviorSubject<boolean>(false);
  showOriginalDoc = new BehaviorSubject<ShowDocumentConfig>({
    showOrginal: false,
    viewPercent: 50,
  });
  pageChange = new BehaviorSubject<boolean>(true);
  showDebugger = new BehaviorSubject<boolean>(false);

  constructor() {}
}
