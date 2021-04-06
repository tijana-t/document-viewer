import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { thumbnails } from '../thumbnails';
import { NavigationConfig } from '../_config/page-navigation.model';

@Component({
  selector: 'lib-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent implements OnInit, AfterViewInit {
  @ViewChild('thumbnailContainer') thumbnailContainer: any;
  @ViewChild('thumbnailImage') thumbnail: any;
  @ViewChild('bubbleWrap') bubbleWrap: any;
  @ViewChild('inputRange') inputRange: any;
  @ViewChild('bubbleValue') bubbleValue: any;
  thumbnails: { id: string; src: string }[] = [{ id: '', src: '' }];
  navigationConfig: NavigationConfig = {
    containerHeight: 600,
    imageMargin: 20,
  };
  oldPageNumber: number = 1;
  pageNumber: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.thumbnails = thumbnails;
  }

  ngAfterViewInit() {
    this.calculateThumbPosition();
  }

  calculateThumbPosition = (inputEvent?: any) => {
    const newValue = Number(
        ((this.inputRange.nativeElement.value -
          this.inputRange.nativeElement.min) *
          100) /
          (this.inputRange.nativeElement.max -
            this.inputRange.nativeElement.min)
      ),
      newPosition = 10 - newValue * 0.2;
    this.bubbleValue.nativeElement.innerText = this.inputRange.nativeElement.value;
    this.bubbleWrap.nativeElement.style.left = `calc(${newValue}% + (${newPosition}px))`;

    // call only on input change
    if (inputEvent) {
      this.scrollThumbnailContainer(
        this.thumbnailContainer.nativeElement,
        this.thumbnail.nativeElement,
        inputEvent.target.value
      );
    }
  };

  scrollThumbnailContainer(
    container: HTMLElement,
    thumbnail: HTMLElement,
    pageNumber: number
  ) {
    if (pageNumber >= this.oldPageNumber) {
      container.scrollTop += thumbnail.clientHeight;
    } else {
      container.scrollTop -= thumbnail.clientHeight;
    }

    this.oldPageNumber = pageNumber;
  }
}
