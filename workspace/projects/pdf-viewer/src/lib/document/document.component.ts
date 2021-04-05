import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit {
  @ViewChild('document') img: ElementRef | undefined;
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    console.log('img', this.img);
  }
}
