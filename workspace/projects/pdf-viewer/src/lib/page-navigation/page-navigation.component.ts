import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PdfViewerService } from '../pdf-viewer.service';
import { thumbnails } from '../thumbnails';
import { DocumentConfig } from '../_config/document.model';
import { NavigationConfig } from '../_config/page-navigation.model';

@Component({
  selector: 'lib-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent implements OnInit, AfterViewInit {
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef | undefined;
  @ViewChild('thumbnailImage') thumbnail: ElementRef | undefined;
  @ViewChild('bubbleWrap') bubbleWrap: ElementRef | undefined;
  @ViewChild('inputRange') inputRange: ElementRef | undefined;
  @ViewChild('bubbleValue') bubbleValue: ElementRef | undefined;
  thumbnails: { id: string; src: string }[] = [{ id: '', src: '' }];
  navigationConfig: NavigationConfig = {
    imageMargin: 20,
  };
  documentConfig: DocumentConfig = {
    containerHeight: 750,
  };
  oldPageNumber: number = 1;
  pageNumber: number = 1;

  constructor(private pdfViewerService: PdfViewerService) {}

  ngOnInit(): void {
    this.thumbnails = thumbnails;
  }

  scrollToPageNumber(pageNumber: number) {
    const offsetTop = document.getElementById('img-' + pageNumber)?.offsetTop;
    this.thumbnailContainer?.nativeElement.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
    this.pdfViewerService.pageNumberSubject.next(pageNumber);
  }

  ngAfterViewInit() {
    this.calculateThumbPosition();
  }

  changePage(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.pdfViewerService.pageNumberSubject.next(pageNumber);
  }

  scrollThumbnail(event: WheelEvent, inputRange: any) {
    const inputNumber = parseInt(inputRange.value, 10);
    if (event.deltaY < 0 && inputNumber !== 1) {
      // scrolling up
      inputRange.value = (inputNumber - 1).toString();
      this.calculateThumbPosition(parseInt(inputRange.value, 10));
    } else if (event.deltaY > 0 && inputNumber !== this.thumbnails.length) {
      //  scrolling down
      inputRange.value = (parseInt(inputRange.value, 10) + 1).toString();
      this.calculateThumbPosition(parseInt(inputRange.value, 10));
    }
  }

  calculateThumbPosition = (pageNumber?: number) => {
    if (
      this.inputRange &&
      this.bubbleValue &&
      this.thumbnailContainer &&
      this.thumbnail &&
      this.bubbleWrap
    ) {
      const newValue = Number(
          ((this.inputRange.nativeElement.value -
            this.inputRange.nativeElement.min) *
            100) /
            (this.inputRange.nativeElement.max -
              this.inputRange.nativeElement.min)
        ),
        newPosition = 10 - newValue * 0.2;
      this.bubbleValue.nativeElement.innerText = this.inputRange.nativeElement.value;
      this.bubbleWrap.nativeElement.style.top = `calc(${newValue}% + (${newPosition}px))`;

      // call only on input change
      if (pageNumber) {
        this.scrollThumbnailContainer(
          this.thumbnailContainer.nativeElement,
          this.thumbnail.nativeElement,
          pageNumber
        );
      }
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
