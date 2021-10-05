import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  Input,
} from '@angular/core';
import { withCache } from '@ngneat/cashew';
import { Observable } from 'rxjs';
import { Thumbnail } from '../../lib/_config/thumbnail.model';

@Directive({
  selector: 'img[appLazyLoad]',
})
export class LazyLoadDirective implements AfterViewInit {
  @HostBinding('attr.src') srcAttr: any = null;
  @Input() src: string = '';
  @Input() imageObj: Thumbnail = { id: '', src: '', show: false };

  constructor(private el: ElementRef, private http: HttpClient) {}

  ngAfterViewInit() {
    this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
  }

  private canLazyLoad() {
    return window && 'IntersectionObserver' in window;
  }

  private lazyLoadImage() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.loadImage();
          obs.unobserve(this.el.nativeElement);
        }
      });
    });
    obs.observe(this.el.nativeElement);
  }

  private loadImage() {
    // try to add loader over image, before source is loaded
    // const doc = document.getElementById(`spinner-${this.imageObj.id}`);
    // if (doc) {
    //   doc.style.visibility = 'visible !important';
    // }
    // this.srcAttr = '';

    this.imageObj.show = true;
    this.transform(this.src).subscribe((res) => {
      if (res) {
        this.srcAttr = res;
        this.imageObj.show = false;
      }
    });
  }

  private transform(url: string) {
    return new Observable<string>((observer) => {
      observer.next(
        'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      );

      const { next, error } = observer;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
      // eslint-disable-next-line object-shorthand

      this.http
        .get(url, { ...withCache(), responseType: 'blob', headers })
        .subscribe((response) => {
          const reader = new FileReader();
          reader.readAsDataURL(response);
          reader.onloadend = () => {
            if (reader && reader.result) {
              observer.next(reader.result.toString());
            }
          };
        });

      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      return { unsubscribe() {} };
    });
  }
}
