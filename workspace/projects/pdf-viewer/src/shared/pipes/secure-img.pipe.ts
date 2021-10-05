/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { withCache } from '@ngneat/cashew';

@Pipe({
  name: 'secureImg',
})
export class SecureImgPipe implements PipeTransform {
  constructor(private http: HttpClient) {}

  transform(url: string) {
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
            if (reader.result) {
              observer.next(reader.result.toString());
            }
          };
        });

      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      return { unsubscribe() {} };
    });
  }
}
