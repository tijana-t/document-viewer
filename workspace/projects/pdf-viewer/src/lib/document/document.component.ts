import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { pages } from '../pages';
import { PdfViewerService } from '../pdf-viewer.service';
import { DocumentConfig } from '../_config/document.model';

@Component({
  selector: 'lib-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('documentCanvas') documentCanvas: any;
  @ViewChild('documentImage') documentImage: any;
  private readonly destroy$ = new Subject();
  documentConfig: DocumentConfig = {
    containerHeight: 750,
  };

  pages: { id: string; src: string }[] = [{ id: '', src: '' }];
  image = new Image();
  pageNumber: number = 1;
  subscriptions = new Subscription();
  constructor(private pdfViewerService: PdfViewerService) {
    this.pdfViewerService.pageNumberSubject
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.pageNumber = res;
          this.documentImage.nativeElement.src = pages[this.pageNumber - 1].src;
        }
      });
  }

  ngOnInit(): void {
    this.pages = pages;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit() {}
}
