import { Component, OnInit } from '@angular/core';
import { thumbnails } from './thumbnails';

@Component({
  selector: 'lib-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./styles/global.scss'],
})
export class PdfViewerComponent implements OnInit {
  thumbnails: { id: string; src: string }[] = [{ id: '', src: '' }];
  constructor() {}

  ngOnInit(): void {
    this.thumbnails = thumbnails;
  }
}
