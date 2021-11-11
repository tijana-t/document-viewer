import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  Input,
} from '@angular/core';
import { withCache } from '@ngneat/cashew';
import { Observable, Subject } from 'rxjs';
import { Thumbnail } from '../../lib/_config/thumbnail.model';

@Directive({
  selector: 'img[appLazyLoad]',
})
export class LazyLoadDirective implements AfterViewInit {
  @HostBinding('attr.src') srcAttr: any = null;
  @Input() src: string = '';
  @Input() imageObj: Thumbnail = { id: '', src: '', show: true };
  destroy$ = new Subject();

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
    this.imageObj.show = false;
    this.transform(this.src).subscribe((res) => {
      if (res) {
        this.srcAttr = res;
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
              this.imageObj.show = true;
            }
          };
        });

      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      return { unsubscribe() {} };
    });
  }
}
