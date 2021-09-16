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
import { DocumentActions } from './_config/document-actions.model';
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
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    zoomInSrc: '',
    zoomOutSrc: '',
    fitToPageSrc: '',
  };
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerHeight: 0,
    containerWidth: 0,
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
      this.documentConfig = changes['documentConfig'].currentValue;
    }
  }
}
