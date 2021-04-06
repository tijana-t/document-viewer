import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { PdfViewerComponent } from './../pdf-viewer.component';

@Component({
  selector: 'lib-document-actions',
  templateUrl: './document-actions.component.html',
  styleUrls: ['./document-actions.component.scss'],
})
export class DocumentActionsComponent implements OnInit, AfterViewInit {
  @Input('document') document: DocumentComponent | undefined;
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    console.log('DOCA', this.document?.documentImage.nativeElement);
  }

  zoomIn() {
    let myImg = this.document?.documentImage.nativeElement;
    let currWidth = myImg.clientWidth;
    if (currWidth == 2500) return false;
    else {
      return (myImg.style.width = currWidth + 100 + 'px');
    }
  }

  zoomOut() {
    let myImg = this.document?.documentImage.nativeElement;
    let currWidth = myImg.clientWidth;
    if (currWidth == 100) return false;
    else {
      return (myImg.style.width = currWidth - 100 + 'px');
    }
  }

  fitToPage() {
    let myImg = this.document?.documentImage.nativeElement;
    return (myImg.style.width = '80%');
  }
}
