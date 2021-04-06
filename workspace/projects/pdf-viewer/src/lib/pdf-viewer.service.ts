import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfViewerService {
  pageNumberSubject = new BehaviorSubject<number>(1);

  constructor() {}
}
