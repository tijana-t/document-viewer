import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { from, Subject, Subscription } from 'rxjs';
import { PdfViewerService } from '../pdf-viewer.service';
import { CanvasConfig } from '../_config/canvas.model';
import { pages } from '../pages';
import { skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lib-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('documentCanvas') documentCanvas: any;
  @ViewChild('documentImage') documentImage: any;
  private readonly destroy$ = new Subject();

  pages: { id: string; src: string }[] = [{ id: '', src: '' }];
  image = new Image();
  pageNumber: number = 1;
  canvasConfig: CanvasConfig = {
    canvasWidth: 600,
    canvasHeight: 1000,
  };
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
