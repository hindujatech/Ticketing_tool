import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'filter' })
export class customFilter implements PipeTransform {
  transform(data: any): string {
    var split_string = data.split("_");
    return split_string.join(' ');
  }
}