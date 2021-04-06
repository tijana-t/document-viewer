import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DocumentComponent } from '../document/document.component';

@Component({
  selector: 'lib-document-actions',
  templateUrl: './document-actions.component.html',
  styleUrls: ['./document-actions.component.scss'],
})
export class DocumentActionsComponent implements OnInit, AfterViewInit {
  @ViewChild('document') document: DocumentComponent | undefined;
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {}

  zoomIn() {
    // let myImg = this.document?.img?.nativeElement;
    // let currWidth = myImg.clientWidth;
    // if (currWidth == 2500) return false;
    // else {
    //   return (myImg.style.width = currWidth + 100 + 'px');
    // }
  }

  zoomOut() {
    // let myImg = this.document?.img?.nativeElement;
    // let currWidth = myImg.clientWidth;
    // if (currWidth == 100) return false;
    // else {
    //   return (myImg.style.width = currWidth - 100 + 'px');
    // }
  }

  fitToPage() {
    // let myImg = this.document?.img?.nativeElement;
    // return (myImg.style.width = '100%');
  }
}
