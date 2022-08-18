import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringEllipsis',
})
@Injectable()
export class StringEllipsisPipe implements PipeTransform {
  transform(name: string, maxLength: number): any {
    if (name && name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    } else {
      return name;
    }
  }
}
