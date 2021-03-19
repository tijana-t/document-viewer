import { TestBed } from '@angular/core/testing';

import { PdfViewerService } from './pdf-viewer.service';

describe('PdfViewerService', () => {
  let service: PdfViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
