
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
import { Router } from '@angular/router';

@Component({
  selector: 'lib-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit, AfterViewInit, OnChanges {
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
  @Input('docModel') docModel: string= '';
  @Input('params') params: any;
  @Input('singleDocument') singleDocument: any;
  @Input('inProjects') inProjects: any;

  docName: string = '';
  docDate: string = '';
  private url : string = '';

  constructor(
    private pdfViewerService: PdfViewerService,
    private router: Router) {}

  ngOnInit() {
    this.url = this.router.url;
    this.docName = this.singleDocument.file.originalName;
    this.docDate = this.singleDocument.file.createdAt.toString();
    
  }

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

  changeDoc(status: boolean){

    this.docName = this.singleDocument.file.originalName;
    this.docDate = this.singleDocument.file.createdAt.toString();
if(!this.inProjects){
    if (status) {
      this.router.navigateByUrl(
        `/training/models/${this.url.split('/')[3]}/${this.params.modelId}/${
          this.url.split('/')[5]
        }/${this.singleDocument.next.id}/${this.singleDocument.next.fileName}/1/`
      );
      this.docName = this.singleDocument.next.name;
    this.docDate = this.singleDocument.next.date.toString();
    } else {
      this.router.navigateByUrl(
        `/training/models/${this.url.split('/')[3]}/${this.params.modelId}/${
          this.url.split('/')[5]
        }/${this.singleDocument.prev.id}/${this.singleDocument.prev.fileName}/1/`
      );
      this.docName = this.singleDocument.prev.name;
    this.docDate = this.singleDocument.prev.date.toString();
    }
  } else {
    if (status) {
      this.router.navigateByUrl(
        `/projects/viewer/${this.url.split('/')[3]}/${this.url.split('/')[4]}/${
          this.singleDocument.next.id
        }/${this.singleDocument.next.fileName}/1/`
      );
      this.docName = this.singleDocument.next.name;
    this.docDate = this.singleDocument.next.date.toString();
    } else {
      this.router.navigateByUrl(
        `/projects/viewer/${this.url.split('/')[3]}/${this.url.split('/')[4]}/${
          this.singleDocument.prev.id
        }/${this.singleDocument.prev.fileName}/1/`
      );
      this.docName = this.singleDocument.prev.name;
    this.docDate = this.singleDocument.prev.date.toString();
    }
  }
  }
  
}
