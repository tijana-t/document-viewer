import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DocumentConfig } from '../public-api';

@Injectable({
  providedIn: 'root',
})
export class PdfViewerService {
  pageNumberSubject = new BehaviorSubject<number>(1);
  token = new BehaviorSubject<string>('');
  docConfSubject = new BehaviorSubject<DocumentConfig>({
    containerWidth: 0,
    containerHeight: 0,
  });

  constructor() {}
}
