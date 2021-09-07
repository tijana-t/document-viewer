import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { PdfViewerService } from './pdf-viewer.service';
import { DocumentConfig } from './_config/document.model';
import { Thumbnail } from './_config/thumbnail.model';
@Component({
  selector: 'lib-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit, AfterViewInit, OnChanges {
  constructor(private pdfViewerService: PdfViewerService) {}
  @Input('documentImg') documentImg: string = '';
  @Input('token') token?: string = '';
  @Input('thumbnails') thumbnails: Thumbnail[] = [{ id: '', src: '' }];
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerHeight: '',
    containerWidth: '',
  };

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentImg'] && changes['documentImg'].currentValue) {
      this.documentImg = changes['documentImg'].currentValue;
    }
    if (changes['token'] && changes['token'].currentValue) {
      this.pdfViewerService.token.next(changes['token'].currentValue);
    }
    if (changes['thumbnails'] && changes['thumbnails'].currentValue) {
      this.thumbnails = changes['thumbnails'].currentValue;
    }
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.thumbnails = changes['documentConfig'].currentValue;
    }
  }
}
