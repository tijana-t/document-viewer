import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { PdfViewerService } from '../pdf-viewer.service';
import { DocumentConfig } from '../_config/document.model';
import { Thumbnail } from '../_config/thumbnail.model';

@Component({
  selector: 'lib-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('documentCanvas') documentCanvas: any;
  @ViewChild('documentImage') documentImage: any;
  @Input('thumbnails') thumbnails: Thumbnail[] = [{ id: '', src: '' }];
  @Input('documentImg') documentImg: string = '';

  private readonly destroy$ = new Subject();
  documentConfig: DocumentConfig = {
    containerHeight: '700px',
    containerWidth: 'auto',
  };

  image = new Image();
  pageNumber: number = 1;
  subscriptions = new Subscription();
  constructor(private pdfViewerService: PdfViewerService) {
    this.pdfViewerService.pageNumberSubject
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.pageNumber = res;
          this.documentImage.nativeElement.src =
            this.thumbnails[this.pageNumber - 1].src;
        }
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentImg'] && changes['documentImg'].currentValue) {
      this.documentImg = changes['documentImg'].currentValue;

      console.log(localStorage.getItem('token'));
    }
    if (changes['thumbnails'] && changes['thumbnails'].currentValue) {
      this.thumbnails = changes['thumbnails'].currentValue;
    }
  }
}
